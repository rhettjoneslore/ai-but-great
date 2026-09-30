/* ==========================================================================
   mock-api.js — THE FAKE BACKEND
   --------------------------------------------------------------------------
   Everything here runs in the browser and saves to localStorage. It exists
   so the UI can be clicked through end to end before the real backend is
   built.

   EVAN: every public function on `ABG.api` is one real endpoint. Each has a
   "REAL:" comment saying what the server version should do. Replace the body
   with a fetch() and keep the same return shape, and the UI won't need to
   change. The rules (who gets a free response, when to show the paywall,
   what a payment unlocks) live here on purpose, because on the real site
   they must live on the server, never in the browser.

   Integrations are faked by `emit(kind, name, props)`, which writes to the
   event log you can see in the "For Evan" panel (bottom right of every page):
     posthog  → posthog.capture(name, props)   (site + server)
     stripe   → Stripe API call or webhook
     loops    → Loops contact upsert / transactional email
     twilio   → SMS send
     server   → something the backend does on its own (rate limit, etc.)
   ========================================================================== */
(function () {
  const DB_KEY = 'abg_mock_db_v2';
  const SESSION_KEY = 'abg_mock_session_v2';
  const DAY = 86400000;

  /* ---- Config. REAL: a `settings` table editable from /admin, never hardcoded. */
  const DEFAULT_CONFIG = {
    freeResponses: 3,            // per device + connection, not per account
    referralBonus: 3,            // both sides get this many free responses
    limits: { perMinute: 5, perDay: 150 },
    prices: {
      A: { lifetime: 200, pass7: 25, weekly: 15, single: 3 },
      B: { lifetime: 150, pass7: 20, weekly: 12, single: 3 },
    },
    priceTest: { enabled: false, splitB: 50 },   // % of new visitors put in B
  };

  /* Plan catalog. Labels live in code; AMOUNTS come from config. */
  const PLANS = {
    lifetime: { id: 'lifetime', name: 'Lifetime', blurb: 'Pay once. Write forever.', recurring: false },
    pass7:    { id: 'pass7', name: '7-day pass', blurb: "Doesn't renew. No surprise charges.", recurring: false },
    weekly:   { id: 'weekly', name: '7 days, auto-renew', blurb: 'Renews weekly. Cancel anytime in Settings.', recurring: true },
    single:   { id: 'single', name: 'Just this response', blurb: 'Unlock this one answer.', recurring: false },
  };
  const PLAN_ORDER = ['lifetime', 'pass7', 'weekly', 'single']; // lifetime first, on purpose

  /* ---------------------------------------------------------------- storage */
  function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }
  function uid(p) { return p + '_' + Math.random().toString(36).slice(2, 10); }
  function now() { return Date.now(); }

  function seedUsers() {
    const r = rng(42);
    const first = ['Maya','Jordan','Priya','Luis','Tess','Sam','Renee','Chris','Ava','Dana','Marcus','Kayla','Jake','Nina','Omar','Grace','Theo','Lena','Iris','Ben','Zoe','Eli','Rosa','Kai'];
    const last = ['Ortiz','Lee','Shah','Moreno','Walsh','Reyes','Park','Nolan','Kim','Brooks','Hale','Ross','Morrow','Diaz','Farah','Chen','Baker','Novak','Quinn','Adler','Hart','Stone','Vega','Ito'];
    const sources = ['tiktok','tiktok','tiktok','instagram','instagram','google','referral','direct'];
    const users = {}, purchases = [];
    first.forEach((f, i) => {
      const id = 'u_seed' + i;
      const created = now() - Math.floor(r() * 60) * DAY;
      const roll = r();
      const u = {
        id, name: f + ' ' + last[i], email: (f + '.' + last[i]).toLowerCase() + '@example.com',
        photo: null, createdAt: created, source: sources[Math.floor(r() * sources.length)],
        refCode: (f.slice(0, 3) + i).toUpperCase(), referredBy: null,
        marketingOptIn: r() > 0.15, marketingAt: created,
        phone: r() > 0.7 ? '+1555010' + String(1000 + i).slice(1) : null, smsOptIn: false, smsAt: null, smsIp: null,
        bonusFree: 0, lifetime: false, passEndsAt: null, autoRenew: false, singleCredits: 0,
        savedCard: null, wordsWritten: Math.floor(r() * 40000), responses: 0, priceVariant: r() > 0.5 ? 'B' : 'A',
        role: i === 0 ? 'admin' : 'user',
      };
      u.smsOptIn = !!u.phone; u.smsAt = u.phone ? created : null; u.smsIp = u.phone ? '203.0.113.' + i : null;
      u.responses = Math.max(1, Math.floor(u.wordsWritten / 320));
      const buy = (plan, amount, at) => purchases.push({ id: uid('pi'), userId: id, plan, amount, status: 'paid', method: 'Apple Pay', createdAt: at });
      if (roll > 0.85) { u.lifetime = true; buy('lifetime', 200, created + DAY); }
      else if (roll > 0.65) { u.autoRenew = true; u.passEndsAt = now() + Math.floor(r() * 7) * DAY; buy('weekly', 15, created + DAY); buy('weekly', 15, created + 8 * DAY); }
      else if (roll > 0.5) { u.passEndsAt = now() - 2 * DAY; buy('pass7', 25, created + DAY); }
      else if (roll > 0.4) { buy('single', 3, created + DAY); }
      if (!u.lifetime && !u.passEndsAt && roll < 0.4) u.wordsWritten = Math.floor(u.wordsWritten / 20);
      users[id] = u;
    });
    return { users, purchases };
  }

  function freshDb() {
    const { users, purchases } = seedUsers();
    return {
      config: JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
      users, purchases,
      devices: {},          // REAL: keyed by FingerprintJS visitorId + IP
      conversations: {},
      responses: {},
      rate: {},
      waitlist: { count: 1240, entries: [] },
      referrals: [],
      events: [],
      flags: { failNextPayment: false, forceEU: false },
      contentOverrides: {},
    };
  }

  let db;
  function load() {
    try { db = JSON.parse(localStorage.getItem(DB_KEY)); } catch (e) { db = null; }
    if (!db || !db.config) { db = freshDb(); save(); }
  }
  function save() { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {} }

  function session() {
    let s;
    try { s = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) {}
    if (!s || !s.deviceId) {
      s = { deviceId: uid('dev'), userId: null, variant: null };
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
    }
    return s;
  }
  function setSession(patch) {
    const s = Object.assign(session(), patch);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  load();

  /* ------------------------------------------------------------ event log */
  function emit(kind, name, props) {
    const e = { kind, name, props: props || {}, at: now() };
    db.events.unshift(e);
    db.events = db.events.slice(0, 300);
    save();
    if (window.console) console.log('%c[' + kind + ']', 'color:#c22', name, props || '');
    window.dispatchEvent(new CustomEvent('abg:event', { detail: e }));
  }

  /* PostHog stand-in. REAL: posthog.capture(event, props). Every event gets
     the visitor's first-touch source attached (see firstTouch in common.js). */
  function track(event, props) {
    const ft = firstTouch();
    emit('posthog', event, Object.assign({ source: ft.source || 'direct' }, props || {}));
  }
  function firstTouch() {
    try { return JSON.parse(localStorage.getItem('abg_first_touch')) || {}; } catch (e) { return {}; }
  }

  /* ------------------------------------------------------------- helpers */
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const net = (v, ms) => wait(ms == null ? 250 + Math.random() * 250 : ms).then(() => JSON.parse(JSON.stringify(v)));

  function device() {
    const s = session();
    if (!db.devices[s.deviceId]) db.devices[s.deviceId] = { freeUsed: 0, createdAt: now() };
    return db.devices[s.deviceId];
  }
  function currentUser() {
    const s = session();
    return s.userId ? db.users[s.userId] || null : null;
  }

  function variantFor(user) {
    if (!db.config.priceTest.enabled) return 'A';
    if (user && user.priceVariant) return user.priceVariant;
    const s = session();
    if (!s.variant) {
      const v = Math.random() * 100 < db.config.priceTest.splitB ? 'B' : 'A';
      setSession({ variant: v });
      track('price_variant_assigned', { variant: v });
      return v;
    }
    return s.variant;
  }
  function prices(user) { return db.config.prices[variantFor(user)] || db.config.prices.A; }

  function spent(user) {
    return db.purchases.filter((p) => p.userId === user.id && p.status === 'paid').reduce((a, p) => a + p.amount, 0);
  }

  /* The one record per user of what they can use (spec: "Keep one record per
     user"). REAL: an `entitlements` row, updated only by Stripe webhooks and
     admin actions. */
  function entitlements(user) {
    const dev = device();
    const baseLeft = Math.max(0, db.config.freeResponses - dev.freeUsed);
    const e = {
      freeLeft: baseLeft + (user ? user.bonusFree : 0),
      lifetime: !!(user && user.lifetime),
      passEndsAt: user ? user.passEndsAt : null,
      autoRenew: !!(user && user.autoRenew),
      singleCredits: user ? user.singleCredits : 0,
      pastDue: !!(user && user.pastDue),
    };
    e.passActive = !!(e.passEndsAt && e.passEndsAt > now());
    e.hasAccess = e.lifetime || e.passActive;
    return e;
  }

  function rateCheck(key, isPaid) {
    const t = now();
    const list = (db.rate[key] || []).filter((x) => t - x < DAY);
    const lastMin = list.filter((x) => t - x < 60000).length;
    if (lastMin >= db.config.limits.perMinute) return { ok: false, reason: 'minute', retryIn: 60 - Math.floor((t - list.filter((x) => t - x < 60000)[0]) / 1000) };
    if (isPaid && list.length >= db.config.limits.perDay) return { ok: false, reason: 'day' };
    list.push(t); db.rate[key] = list;
    return { ok: true };
  }

  function countWords(s) { return (s.match(/\S+/g) || []).length; }
  function firstParagraph(s) { return s.split(/\n\s*\n/)[0]; }

  /* Stand-in for the model. REAL: call Evan's humanized model here, server-side. */
  function fakeWrite(prompt) {
    const ex = (window.ABG_EXAMPLES || []).find((x) => x.prompt.trim().toLowerCase() === prompt.trim().toLowerCase());
    if (ex && window.ABG_FORMATS) return window.ABG_FORMATS.plainText(ex);
    return [
      'This is placeholder text. The real humanized model isn\'t hooked up yet, so this box is where its answer to "' + prompt.trim() + '" will appear.',
      'When the model is live, this response will read like a person wrote it: the right length for what you asked, specific details instead of filler, and no stock phrases like "I hope this finds you well."',
      'For now the words are fake, but everything around them is real: the word count below is counted, the time is measured, and this response is saved to your chat history so you can come back to it.',
      'If this were your fourth response and you had no plan, only the first paragraph would be visible. The rest would sit blurred under the payment options until you paid, and then it would unblur without being rewritten.',
    ].join('\n\n');
  }

  function ownerKey() {
    const u = currentUser();
    return u ? 'u:' + u.id : 'd:' + session().deviceId;
  }

  function publicResponse(r) {
    // REAL: never send the full text of a locked response to the browser.
    // Send the first paragraph only; the blurred part is decoy text.
    if (r.locked) return { id: r.id, locked: true, preview: firstParagraph(r.text), words: r.words, ms: r.ms, createdAt: r.createdAt };
    return { id: r.id, locked: false, text: r.text, words: r.words, ms: r.ms, createdAt: r.createdAt };
  }

  /* ------------------------------------------------------ Stripe webhooks */
  /* REAL: POST /api/stripe/webhook. Verify the signature, then update the
     entitlements row. This is the ONLY place paid access should change
     (besides admin grants). */
  function stripeWebhook(type, data) {
    emit('stripe', 'webhook: ' + type, data);
    const u = db.users[data.userId];
    if (!u) return;
    if (type === 'payment_intent.succeeded' || type === 'invoice.paid') {
      const plan = data.plan;
      if (plan === 'lifetime') { u.lifetime = true; u.autoRenew = false; }
      if (plan === 'pass7') { u.passEndsAt = Math.max(now(), u.passEndsAt || 0) + 7 * DAY; u.autoRenew = false; }
      if (plan === 'weekly') { u.passEndsAt = Math.max(now(), u.passEndsAt || 0) + 7 * DAY; u.autoRenew = true; }
      if (plan === 'single') { u.singleCredits += 1; }
      u.pastDue = false;
      emit('loops', 'send transactional: receipt', { email: u.email, plan, amount: data.amount });
      syncLoops(u);
    }
    if (type === 'invoice.payment_failed') {
      u.pastDue = true;
      emit('loops', 'send transactional: payment failed', { email: u.email });
    }
    if (type === 'charge.refunded') {
      const p = db.purchases.find((x) => x.id === data.purchaseId);
      if (p) p.status = 'refunded';
      if (data.plan === 'lifetime') u.lifetime = false;
      if (data.plan === 'pass7' || data.plan === 'weekly') { u.passEndsAt = now() - 1; u.autoRenew = false; }
      syncLoops(u);
    }
    save();
  }

  /* REAL: push to Loops whenever a user is created or changes.
     Our DB is the master list; Loops holds a copy for sending. */
  function syncLoops(u) {
    const e = entitlements(u);
    emit('loops', 'upsert contact', {
      email: u.email, name: u.name, source: u.source, marketingOptIn: u.marketingOptIn,
      plan: e.lifetime ? 'lifetime' : e.passActive ? (e.autoRenew ? 'weekly' : 'pass') : 'free',
      totalSpent: spent(u),
    });
  }

  /* ============================================================ PUBLIC API */
  const api = {
    PLANS, PLAN_ORDER,

    /* REAL: GET /api/me → user (or null) + entitlements + prices for this visitor. */
    me() {
      const u = currentUser();
      const p = prices(u);
      return net({ user: u ? { id: u.id, name: u.name, email: u.email, photo: u.photo, refCode: u.refCode, role: u.role } : null,
        ent: entitlements(u), prices: p, variant: variantFor(u), config: { freeResponses: db.config.freeResponses } }, 60);
    },

    /* REAL: Google OAuth (scopes: openid email profile — nothing else).
       On success: create or find the user, merge the anonymous device's chats
       into the account, and call posthog.identify() so the funnel before and
       after sign-in stays one person. */
    signInWithGoogle({ marketingOptIn = true, name, email } = {}) {
      const s = session();
      const existing = Object.values(db.users).find((u) => u.email === email);
      let u = existing;
      if (!u) {
        const ft = firstTouch();
        u = {
          id: uid('u'), name: name || 'Demo User', email: email || 'demo.user@example.com', photo: null,
          createdAt: now(), source: ft.ref ? 'referral' : (ft.source || 'direct'), refCode: uid('').slice(1, 7).toUpperCase(),
          referredBy: null, marketingOptIn, marketingAt: now(), phone: null, smsOptIn: false, smsAt: null, smsIp: null,
          bonusFree: 0, lifetime: false, passEndsAt: null, autoRenew: false, singleCredits: 0, savedCard: null,
          wordsWritten: 0, responses: 0, priceVariant: s.variant || null, role: 'user',
        };
        db.users[u.id] = u;
        // Referral: both people get free responses.
        if (ft.ref) {
          const referrer = Object.values(db.users).find((x) => x.refCode === ft.ref && x.id !== u.id);
          if (referrer) {
            u.referredBy = referrer.id;
            u.bonusFree += db.config.referralBonus;
            referrer.bonusFree += db.config.referralBonus;
            db.referrals.push({ referrer: referrer.id, referee: u.id, at: now() });
            emit('server', 'referral credited', { referrer: referrer.email, referee: u.email, each: db.config.referralBonus });
          }
        }
        syncLoops(u);
      }
      // Move anonymous chats to the account.
      Object.values(db.conversations).forEach((c) => { if (c.owner === 'd:' + s.deviceId) c.owner = 'u:' + u.id; });
      setSession({ userId: u.id });
      save();
      emit('posthog', 'identify', { distinct_id: u.id, anon_id: s.deviceId, email: u.email });
      track('signed_in', { new_user: !existing });
      return net({ ok: true });
    },

    /* REAL: POST /api/logout */
    signOut() { setSession({ userId: null }); return net({ ok: true }, 50); },

    /* REAL: POST /api/generate  { prompt, conversationId }
       Server decides, in this order:
         1. Rate limit (per user AND per device/IP)   → status 'rate_limited'
         2. Lifetime or active pass                   → write it
         3. Bought single responses                   → use one, write it
         4. Free responses left
              - 1st free one needs no account
              - 2nd and 3rd need Google sign-in       → status 'needs_signin'
         5. Nothing left                              → write the full answer,
            store it, return status 'paywall' with ONLY the first paragraph.
       Count words per user and per response (we check $1 per 3,000 words). */
    async generate({ prompt, conversationId }) {
      const u = currentUser();
      const dev = device();
      const ent = entitlements(u);
      const rl = rateCheck(u ? 'u:' + u.id : 'd:' + session().deviceId, ent.hasAccess);
      if (!rl.ok) { emit('server', 'rate limited', { reason: rl.reason }); save(); return net({ status: 'rate_limited', reason: rl.reason, retryIn: rl.retryIn }); }

      let mode = null;
      if (ent.hasAccess) mode = 'paid';
      else if (u && u.singleCredits > 0) mode = 'credit';
      else if (ent.freeLeft > 0) {
        if (!u && dev.freeUsed >= 1) { track('saw_signin_prompt'); return net({ status: 'needs_signin' }); }
        mode = 'free';
      } else {
        if (!u) { track('saw_signin_prompt'); return net({ status: 'needs_signin' }); }
        mode = 'locked';
      }

      const started = now();
      const text = fakeWrite(prompt);
      await wait(900 + Math.random() * 900);
      const ms = now() - started;

      // Conversation bookkeeping
      let conv = conversationId && db.conversations[conversationId];
      if (!conv) {
        conv = { id: uid('c'), owner: ownerKey(), title: prompt.slice(0, 60), createdAt: now(), messages: [] };
        db.conversations[conv.id] = conv;
      }
      const r = { id: uid('r'), conversationId: conv.id, prompt, text, words: countWords(text), ms, createdAt: now(), locked: mode === 'locked' };
      db.responses[r.id] = r;
      conv.messages.push({ role: 'user', text: prompt }, { role: 'ai', responseId: r.id });
      conv.updatedAt = now();

      if (mode === 'free') {
        const baseLeft = db.config.freeResponses - dev.freeUsed;
        if (baseLeft > 0) dev.freeUsed += 1; else u.bonusFree -= 1;
      }
      if (mode === 'credit') u.singleCredits -= 1;
      if (u && mode !== 'locked') { u.wordsWritten += r.words; u.responses += 1; }
      if (mode !== 'locked') dev.total = (dev.total || 0) + 1;
      save();

      // Funnel step number: count across the device AND the account, so the
      // response written before sign-in still counts as #1.
      const n = Math.max(dev.total || 0, u ? u.responses : 0);
      if (mode !== 'locked') {
        if (n === 1) track('got_first_response', { words: r.words });
        else if (n === 2) track('got_response_2', { words: r.words });
        else if (n === 3) track('got_response_3', { words: r.words });
        else track('got_response', { words: r.words, paid: mode === 'paid' || mode === 'credit' });
      } else {
        track('saw_payment_screen', { variant: variantFor(u) });
        emit('server', 'schedule: "you didn\'t finish" email (one, not a series)', { email: u.email, sendIn: '24h if still unpaid' });
      }
      return net({ status: mode === 'locked' ? 'paywall' : 'ok', conversationId: conv.id, response: publicResponse(r) }, 50);
    },

    /* REAL: POST /api/responses/:id/unlock — after payment. Returns the SAME
       text that was written before (not a rewrite). */
    unlockResponse(id) {
      const u = currentUser();
      const r = db.responses[id];
      if (!r || !u) return net({ ok: false, error: 'not_found' });
      if (!r.locked) return net({ ok: true, response: publicResponse(r) });
      const ent = entitlements(u);
      if (!ent.hasAccess) {
        if (u.singleCredits > 0) u.singleCredits -= 1;
        else return net({ ok: false, error: 'payment_required' });
      }
      r.locked = false;
      u.wordsWritten += r.words; u.responses += 1;
      save();
      return net({ ok: true, response: publicResponse(r) });
    },

    /* REAL: GET /api/conversations */
    listConversations() {
      const k = ownerKey();
      return net(Object.values(db.conversations).filter((c) => c.owner === k)
        .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
        .map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt || c.createdAt })), 80);
    },

    /* REAL: GET /api/conversations/:id */
    getConversation(id) {
      const c = db.conversations[id];
      if (!c || c.owner !== ownerKey()) return net(null, 60);
      return net({ id: c.id, title: c.title, messages: c.messages.map((m) => m.role === 'user' ? m : { role: 'ai', response: publicResponse(db.responses[m.responseId]) }) }, 80);
    },

    /* ---------- Payments ---------- */

    /* REAL: POST /api/checkout { plan } → create a Stripe PaymentIntent (or
       Subscription for 'weekly') with automatic_payment_methods so Apple Pay,
       Google Pay and Link show up. Use the price from settings for THIS user's
       price variant. Return client_secret + whether they have a saved card. */
    startCheckout(plan, opts = {}) {
      const u = currentUser();
      const p = prices(u);
      let amount = p[plan];
      const offer = api._lifetimeOfferSync();
      if (plan === 'lifetime' && opts.upgrade && offer) amount = offer.price;
      track('started_checkout', { plan, amount, variant: variantFor(u) });
      emit('stripe', plan === 'weekly' ? 'subscriptions.create (incomplete)' : 'paymentIntents.create', { amount: amount * 100, currency: 'usd', customer: u && u.id, setup_future_usage: 'off_session', radar: 'on' });
      return net({ plan: PLANS[plan], amount, savedCard: u ? u.savedCard : null, weeklyPrice: p.weekly });
    },

    /* REAL: this is Stripe Elements confirming on the client, then Stripe
       calling our webhook. The browser never decides access; the webhook does. */
    async confirmCheckout(plan, { method = 'card', upgrade = false } = {}) {
      const u = currentUser();
      if (!u) return net({ ok: false, error: 'Sign in first.' });
      const p = prices(u);
      let amount = p[plan];
      const offer = api._lifetimeOfferSync();
      if (plan === 'lifetime' && upgrade && offer) amount = offer.price;
      await wait(1100);
      if (db.flags.failNextPayment) {
        db.flags.failNextPayment = false;
        db.purchases.unshift({ id: uid('pi'), userId: u.id, plan, amount, status: 'failed', method, createdAt: now() });
        save();
        emit('stripe', 'webhook: payment_intent.payment_failed', { userId: u.id, plan, amount });
        track('payment_failed', { plan, amount });
        return net({ ok: false, error: 'Your card was declined. Try another payment method.' });
      }
      const isRepeat = db.purchases.some((x) => x.userId === u.id && x.status === 'paid');
      const purchase = { id: uid('pi'), userId: u.id, plan, amount, status: 'paid', method, createdAt: now() };
      db.purchases.unshift(purchase);
      if (!u.savedCard) u.savedCard = { label: method === 'card' ? 'Visa •••• 4242' : method };
      save();
      stripeWebhook(plan === 'weekly' ? 'invoice.paid' : 'payment_intent.succeeded', { userId: u.id, plan, amount, purchaseId: purchase.id });
      track(isRepeat ? 'bought_again' : 'paid', { plan, amount, variant: variantFor(u), revenue: amount });
      return net({ ok: true, purchase });
    },

    /* REAL: POST /api/subscription/cancel → stripe.subscriptions.update(
       { cancel_at_period_end: true }). They keep access until the period ends. */
    cancelAutoRenew() {
      const u = currentUser(); if (!u) return net({ ok: false });
      u.autoRenew = false; save();
      emit('stripe', 'subscriptions.update cancel_at_period_end=true', { userId: u.id });
      track('cancelled', { plan: 'weekly' });
      syncLoops(u);
      return net({ ok: true });
    },
    resumeAutoRenew() {
      const u = currentUser(); if (!u) return net({ ok: false });
      u.autoRenew = true; save();
      emit('stripe', 'subscriptions.update cancel_at_period_end=false', { userId: u.id });
      return net({ ok: true });
    },

    /* "You've spent $X. Put it toward lifetime." Shown when a pass has run out. */
    _lifetimeOfferSync() {
      const u = currentUser();
      if (!u || u.lifetime) return null;
      const e = entitlements(u);
      if (e.passActive || !u.passEndsAt) return null;
      const s = spent(u);
      if (!s) return null;
      return { spent: s, price: Math.max(0, prices(u).lifetime - s), full: prices(u).lifetime };
    },
    lifetimeOffer() { return net(api._lifetimeOfferSync(), 60); },

    /* REAL: GET /api/me/purchases */
    myPurchases() {
      const u = currentUser();
      return net(u ? db.purchases.filter((p) => p.userId === u.id) : []);
    },
    myUsage() {
      const u = currentUser();
      return net(u ? { responses: u.responses, words: u.wordsWritten, spent: spent(u) } : null, 60);
    },

    /* ---------- Referrals, email, SMS, waitlist ---------- */

    /* REAL: GET /api/referral */
    referral() {
      const u = currentUser(); if (!u) return net(null);
      const count = db.referrals.filter((r) => r.referrer === u.id).length;
      return net({ link: location.origin + location.pathname.replace(/[^/]*$/, '') + 'index.html?ref=' + u.refCode, code: u.refCode, signups: count, earned: count * db.config.referralBonus, bonus: db.config.referralBonus });
    },

    /* REAL: PATCH /api/me { marketingOptIn } → save + push to Loops.
       Loops also calls US back when someone unsubscribes there, so the two match. */
    setMarketing(on) {
      const u = currentUser(); if (!u) return net({ ok: false });
      u.marketingOptIn = on; u.marketingAt = now(); save(); syncLoops(u);
      return net({ ok: true });
    },
    getPrefs() {
      const u = currentUser(); if (!u) return net(null);
      return net({ marketingOptIn: u.marketingOptIn, phone: u.phone, smsOptIn: u.smsOptIn, smsAt: u.smsAt }, 60);
    },

    /* REAL: POST /api/sms-optin { phone, consent: true }. Save the exact
       consent text, the timestamp, and the IP address (from the request, not
       the browser). Then send the code through Twilio. Never text anyone
       without this record. */
    smsOptIn({ phone, consentText }) {
      const u = currentUser();
      const rec = { phone, consentText, at: now(), ip: '(captured server-side from request)' };
      if (u) { u.phone = phone; u.smsOptIn = true; u.smsAt = rec.at; u.smsIp = rec.ip; syncLoops(u); }
      else { db.waitlist.entries.push({ smsOnly: true, ...rec }); }
      save();
      emit('twilio', 'messages.create', { to: phone, body: 'AI But Great: your code is TEXT20 for 20% off. Reply STOP to opt out.' });
      track('sms_opt_in');
      return net({ ok: true, code: 'TEXT20' });
    },

    /* REAL: POST /api/waitlist { email, launch, ref }. Reusable per launch.
       Each friend who joins with your link moves you up. */
    joinWaitlist({ email, launch = 'default', ref }) {
      db.waitlist.count += 1;
      const code = uid('').slice(1, 7).toUpperCase();
      const entry = { email, launch, code, ref: ref || null, position: db.waitlist.count, invited: 0, at: now() };
      db.waitlist.entries.push(entry);
      const referrer = ref && db.waitlist.entries.find((e) => e.code === ref);
      if (referrer) { referrer.invited += 1; referrer.position = Math.max(1, referrer.position - 25); }
      save();
      emit('loops', 'upsert contact (waitlist)', { email, launch });
      track('joined_waitlist', { launch });
      return net({ position: entry.position, code, perInvite: 25 });
    },

    /* Share + referral tracking. REAL: posthog.capture. */
    trackShare(kind) { track('shared_output', { format: kind }); },
    trackReferralSent() { track('sent_referral'); },

    /* ============================================== ADMIN (role = admin) */
    /* REAL: every admin route checks the signed-in user's role on the server. */
    admin: {
      listUsers(q = '') {
        q = q.toLowerCase();
        return net(Object.values(db.users).filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.includes(q))
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((u) => ({ ...u, ent: entitlements(u), spent: spent(u) })), 120);
      },
      getUser(id) {
        const u = db.users[id]; if (!u) return net(null);
        return net({ user: u, ent: entitlementsFor(u), spent: spent(u), purchases: db.purchases.filter((p) => p.userId === id),
          conversations: Object.values(db.conversations).filter((c) => c.owner === 'u:' + id).length });
      },
      /* REAL: POST /api/admin/users/:id/grant */
      grant(id, { freeResponses = 0, passDays = 0, lifetime = false }) {
        const u = db.users[id]; if (!u) return net({ ok: false });
        if (freeResponses) u.bonusFree += freeResponses;
        if (passDays) u.passEndsAt = Math.max(now(), u.passEndsAt || 0) + passDays * DAY;
        if (lifetime) u.lifetime = true;
        save();
        emit('server', 'admin grant', { user: u.email, freeResponses, passDays, lifetime });
        syncLoops(u);
        return net({ ok: true });
      },
      /* REAL: POST /api/admin/purchases/:id/refund → stripe.refunds.create.
         Access changes when the charge.refunded webhook arrives. */
      refund(purchaseId) {
        const p = db.purchases.find((x) => x.id === purchaseId); if (!p) return net({ ok: false });
        emit('stripe', 'refunds.create', { payment_intent: p.id, amount: p.amount * 100 });
        stripeWebhook('charge.refunded', { userId: p.userId, plan: p.plan, purchaseId: p.id, amount: p.amount });
        return net({ ok: true });
      },
      getConfig() { return net(db.config, 60); },
      /* REAL: PATCH /api/admin/settings */
      setConfig(patch) {
        db.config = Object.assign({}, db.config, patch); save();
        emit('server', 'settings updated', patch);
        return net({ ok: true });
      },
      contacts(f = {}) {
        let rows = Object.values(db.users).map((u) => {
          const e = entitlementsFor(u);
          return { name: u.name, email: u.email, signup: new Date(u.createdAt).toISOString().slice(0, 10), source: u.source,
            plan: e.lifetime ? 'lifetime' : e.passActive ? (e.autoRenew ? 'weekly' : 'pass') : spent(u) ? 'lapsed' : 'free',
            paid: spent(u) > 0, totalSpent: spent(u), emailOptIn: u.marketingOptIn, phone: u.phone || '', smsOptIn: u.smsOptIn,
            smsConsentAt: u.smsAt ? new Date(u.smsAt).toISOString() : '', smsConsentIp: u.smsIp || '' };
        });
        if (f.source) rows = rows.filter((r) => r.source === f.source);
        if (f.plan) rows = rows.filter((r) => f.plan === 'paid' ? r.paid : r.plan === f.plan);
        if (f.emailOptIn) rows = rows.filter((r) => r.emailOptIn);
        if (f.smsOptIn) rows = rows.filter((r) => r.smsOptIn);
        return net(rows, 100);
      },
      unitEconomics() {
        const words = Object.values(db.users).reduce((a, u) => a + u.wordsWritten, 0);
        const revenue = db.purchases.filter((p) => p.status === 'paid').reduce((a, p) => a + p.amount, 0);
        return net({ words, revenue, per3000: words ? revenue / (words / 3000) : 0 }, 60);
      },
      getContent(kind) { return net(db.contentOverrides[kind] || null, 40); },
      /* REAL: CMS write (or commit to the examples file). */
      setContent(kind, value) { db.contentOverrides[kind] = value; save(); emit('server', 'content saved', { kind }); return net({ ok: true }); },
    },

    /* ============================================== DEMO-ONLY CONTROLS */
    /* None of this exists on the real site. It lets you jump between states. */
    demo: {
      events() { return db.events; },
      clearEvents() { db.events = []; save(); },
      flags() { return db.flags; },
      setFlag(k, v) { db.flags[k] = v; save(); },
      resetAll() { localStorage.removeItem(DB_KEY); localStorage.removeItem(SESSION_KEY); localStorage.removeItem('abg_first_touch'); localStorage.removeItem('abg_cookie_choice'); load(); },
      useUpFree() { device().freeUsed = db.config.freeResponses; const u = currentUser(); if (u) u.bonusFree = 0; save(); },
      restoreFree() { device().freeUsed = 0; save(); },
      /* Pretend N days pass. If a weekly plan renews in that time, fire the
         renewal (or a failed payment if "fail next payment" is on). */
      fastForward(days) {
        const u = currentUser(); if (!u || !u.passEndsAt) return;
        const renewDueSoon = u.autoRenew && u.passEndsAt - now() < days * DAY;
        u.passEndsAt -= days * DAY;
        if (renewDueSoon) {
          if (db.flags.failNextPayment) { db.flags.failNextPayment = false; stripeWebhook('invoice.payment_failed', { userId: u.id }); }
          else {
            const p = { id: uid('pi'), userId: u.id, plan: 'weekly', amount: prices(u).weekly, status: 'paid', method: (u.savedCard || {}).label || 'card', createdAt: now() };
            db.purchases.unshift(p);
            u.passEndsAt = now() + 7 * DAY;
            stripeWebhook('invoice.paid', { userId: u.id, plan: 'renewal', amount: p.amount, purchaseId: p.id });
          }
        } else if (u.passEndsAt < now()) {
          emit('loops', 'send transactional: your pass ended (with lifetime offer)', { email: u.email });
        } else if (u.passEndsAt - now() < DAY) {
          emit('loops', 'send transactional: your pass ends in 24 hours (with lifetime offer)', { email: u.email });
        }
        save();
      },
      giveMePlan(plan) {
        const u = currentUser(); if (!u) return;
        stripeWebhook('payment_intent.succeeded', { userId: u.id, plan, amount: 0, demo: true });
      },
    },

    /* Content accessors (showcase examples may be overridden from /admin). */
    content: {
      examples() { return (db.contentOverrides.examples) || window.ABG_EXAMPLES || []; },
      videos() { return (db.contentOverrides.videos) || window.ABG_VIDEOS || []; },
    },

    track, emit, firstTouch,
  };

  function entitlementsFor(u) {
    // Admin view: device counts belong to the browser, so show account-level only.
    const e = { freeLeft: u.bonusFree, lifetime: u.lifetime, passEndsAt: u.passEndsAt, autoRenew: u.autoRenew, singleCredits: u.singleCredits, pastDue: !!u.pastDue };
    e.passActive = !!(u.passEndsAt && u.passEndsAt > now());
    e.hasAccess = e.lifetime || e.passActive;
    return e;
  }

  window.ABG = window.ABG || {};
  window.ABG.api = api;
})();
