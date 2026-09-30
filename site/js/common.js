/* ==========================================================================
   common.js — shared UI on every page:
     masthead, footer, cookie banner, first-touch tracking,
     modals (sign in, paywall plans, checkout, share, lifetime offer),
     and the "For Evan" demo panel + dev notes.
   ========================================================================== */
(function () {
  const api = ABG.api;
  const F = window.ABG_FORMATS;
  const esc = F.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const DAY = 86400000;

  /* ------------------------------------------------ first touch (attribution)
     REAL: PostHog stores this as $initial_* person properties. Save it on the
     user row at signup too, so Loops and the admin panel can filter by it. */
  (function captureFirstTouch() {
    const q = new URLSearchParams(location.search);
    let ft = api.firstTouch();
    if (!ft.at) {
      const ref = document.referrer || '';
      let source = q.get('utm_source') || (q.get('ref') ? 'referral' : '');
      if (!source) {
        if (/tiktok/.test(ref)) source = 'tiktok';
        else if (/instagram/.test(ref)) source = 'instagram';
        else if (/google\./.test(ref)) source = 'google';
        else if (/(twitter|x)\.com|t\.co/.test(ref)) source = 'twitter';
        else source = 'direct';
      }
      ft = { source, ref: q.get('ref') || null, landing: location.pathname, referrer: ref, at: Date.now() };
      try { localStorage.setItem('abg_first_touch', JSON.stringify(ft)); } catch (e) {}
      api.track('landed', { landing: location.pathname });
    } else if (q.get('ref') && !ft.ref) {
      ft.ref = q.get('ref');
      try { localStorage.setItem('abg_first_touch', JSON.stringify(ft)); } catch (e) {}
    }
    api.emit('posthog', '$pageview', { path: location.pathname + location.search });
  })();

  /* ------------------------------------------------ small helpers */
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Copied'); }
    catch (e) { prompt('Copy this:', text); }
  }
  const money = (n) => '$' + (Math.round(n * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0 });
  const daysLeft = (t) => Math.max(0, Math.ceil((t - Date.now()) / DAY));
  const initials = (n) => (n || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const stateChanged = () => window.dispatchEvent(new CustomEvent('abg:state'));

  function modal(html, opts = {}) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true"><button class="x" aria-label="Close">×</button>${html}</div>`;
    document.body.appendChild(back);
    const m = back.firstElementChild;
    const close = () => { back.remove(); document.removeEventListener('keydown', onKey); opts.onClose && opts.onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    m.querySelector('.x').onclick = close;
    return { el: m, close };
  }

  /* Counter text. Spec: "2 free responses left," then "last free response." */
  function counter(ent) {
    if (ent.lifetime) return { text: 'Lifetime', cls: 'good' };
    if (ent.pastDue) return { text: 'Payment failed', cls: 'warn' };
    if (ent.passActive) return { text: (ent.autoRenew ? 'Weekly · renews in ' : 'Pass · ') + daysLeft(ent.passEndsAt) + 'd' + (ent.autoRenew ? '' : ' left'), cls: 'good' };
    if (ent.singleCredits > 0) return { text: ent.singleCredits + ' paid response' + (ent.singleCredits > 1 ? 's' : ''), cls: '' };
    if (ent.freeLeft >= 2) return { text: ent.freeLeft + ' free responses left', cls: '' };
    if (ent.freeLeft === 1) return { text: 'Last free response', cls: 'warn' };
    return { text: 'No free responses left', cls: 'warn' };
  }

  /* ------------------------------------------------ masthead */
  const NAV = [
    { href: 'index.html#showcase', label: 'Showcase', key: 'showcase' },
    { href: 'index.html#videos', label: 'Videos', key: 'videos', opt: true },
    { href: 'archive.html', label: 'The Archive', key: 'archive' },
    { href: 'chat.html', label: 'Write', key: 'chat' },
  ];
  async function masthead(el, { compact = false, current = '' } = {}) {
    const me = await api.me();
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const acct = me.user
      ? `<a href="account.html" title="Your account" ${current === 'account' ? 'aria-current="page"' : ''}><span class="avatar">${esc(initials(me.user.name))}</span></a>`
      : `<a href="#" data-signin>Sign in</a>`;
    const nav = NAV.map((n) => `<a href="${n.href}" class="${n.opt ? 'opt' : ''}" ${current === n.key ? 'aria-current="page"' : ''}>${n.label}</a>`).join('') + acct;
    el.className = 'masthead' + (compact ? ' compact' : '');
    el.innerHTML = compact
      ? `<div class="wrap bar"><a class="name" href="index.html">AI But Great</a><nav class="masthead-nav" style="align-items:center">${nav}</nav></div>`
      : `<div class="wrap">
          <div class="masthead-strip"><span>Vol. 1, No. 1</span><span class="hide-sm">${esc(date)}</span><span>Price: ${me.config.freeResponses} free responses</span></div>
          <h1 class="masthead-name"><a href="index.html">AI But Great</a></h1>
          <p class="masthead-tag">All the words that sound like you, on a good day.</p>
          <nav class="masthead-nav" style="align-items:center">${nav}</nav>
        </div>`;
    const si = el.querySelector('[data-signin]');
    if (si) si.onclick = async (e) => { e.preventDefault(); if (await signIn({ reason: 'nav' })) location.reload(); };
  }

  /* ------------------------------------------------ footer */
  function footer(el) {
    el.className = 'footer';
    el.innerHTML = `<div class="wrap">
      <div class="name">AI But Great</div>
      <nav>
        <a href="terms.html">Terms</a><a href="privacy.html">Privacy</a><a href="refund.html">Refund policy</a><a href="waitlist.html">Waitlist</a>
        <a href="https://www.tiktok.com/@aibutgreat" rel="noopener">TikTok</a><a href="https://www.instagram.com/aibutgreat" rel="noopener">Instagram</a>
        <a href="https://x.com/aibutgreat" rel="noopener">X</a><a href="account.html">Account</a>
      </nav>
      <div class="fine">© ${new Date().getFullYear()} AI But Great. Printed on recycled pixels. · <a href="admin.html">Admin (demo)</a></div>
    </div>`;
  }

  /* ------------------------------------------------ cookie banner (EU only)
     REAL: decide by IP country (Cloudflare/Vercel geo header), not timezone.
     Until they accept, PostHog runs cookieless / opted out. */
  function cookieBanner() {
    let choice; try { choice = localStorage.getItem('abg_cookie_choice'); } catch (e) {}
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const eu = /^Europe\//.test(tz) || api.demo.flags().forceEU;
    if (choice || !eu) return;
    const c = document.createElement('div');
    c.className = 'cookie';
    c.setAttribute('data-dev', 'Only shown to EU visitors. Until "Accept", init PostHog with persistence:"memory" (no cookies). Store the choice.');
    c.innerHTML = `<b>Cookies, briefly.</b> We use necessary cookies to keep you signed in. With your OK we'd also use analytics cookies to see which pages work. <a href="privacy.html">Privacy</a>
      <div class="row-inline"><button class="btn btn-sm" data-c="necessary">Only necessary</button><button class="btn btn-sm btn-ink" data-c="all">Accept all</button></div>`;
    document.body.appendChild(c); document.body.classList.add('cookie-open');
    c.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => {
      try { localStorage.setItem('abg_cookie_choice', b.dataset.c); } catch (e) {}
      api.emit('posthog', b.dataset.c === 'all' ? 'opt_in_capturing' : 'stay cookieless', {});
      c.remove(); document.body.classList.remove('cookie-open');
    });
  }

  /* ------------------------------------------------ sign in (Google, mocked) */
  function signIn({ reason = 'generic' } = {}) {
    return new Promise((resolve) => {
      let done = false;
      const title = reason === 'second' ? 'Sign in to keep writing' : reason === 'pay' ? 'Sign in to unlock' : 'Sign in';
      const sub = reason === 'second' ? 'Your next 2 responses are still free. One tap, no password.'
        : reason === 'pay' ? 'We need an account to attach your purchase to.' : 'One tap, no password.';
      const m = modal(`
        <h2>${title}</h2><p class="muted">${sub}</p>
        <div data-step="1">
          <button class="btn" style="width:100%;background:#fff" data-google data-dev="Google OAuth. Scopes: openid email profile ONLY. On success: create user, merge anon chats, posthog.identify(userId), upsert contact in Loops.">
            <span style="font-weight:800;background:conic-gradient(#EA4335 0 25%,#FBBC05 0 50%,#34A853 0 75%,#4285F4 0);-webkit-background-clip:text;background-clip:text;color:transparent;font-size:18px">G</span>
            Continue with Google</button>
          <label class="check"><input type="checkbox" data-mkt checked> Email me the occasional tip or deal. Unsubscribe anytime.</label>
          <p class="mono muted" style="margin:6px 0 0">We only get your name, email, and profile photo from Google. By continuing you agree to our <a href="terms.html">Terms</a> and <a href="privacy.html">Privacy Policy</a>.</p>
        </div>
        <div data-step="2" class="hidden">
          <p class="label">Demo: pretend Google account picker</p>
          <label class="field"><span>Name</span><input class="input" data-name value="Jordan Demo"></label>
          <label class="field"><span>Email</span><input class="input" data-email value="jordan.demo@example.com"></label>
          <button class="btn btn-red" style="width:100%" data-go>Continue as this account</button>
        </div>`, { onClose: () => { if (!done) resolve(false); } });
      m.el.querySelector('[data-google]').onclick = () => { m.el.querySelector('[data-step="1"]').classList.add('hidden'); m.el.querySelector('[data-step="2"]').classList.remove('hidden'); };
      m.el.querySelector('[data-go]').onclick = async (e) => {
        e.target.disabled = true;
        await api.signInWithGoogle({ marketingOptIn: m.el.querySelector('[data-mkt]').checked, name: m.el.querySelector('[data-name]').value.trim(), email: m.el.querySelector('[data-email]').value.trim().toLowerCase() });
        done = true; m.close(); stateChanged(); resolve(true);
      };
    });
  }

  /* ------------------------------------------------ plans (paywall options)
     Lifetime FIRST so the others look small next to it. Prices come from
     settings (admin panel), never hardcoded. */
  function plansHtml(prices) {
    const save = Math.round((1 - prices.weekly / prices.pass7) * 100);
    const P = api.PLANS;
    const row = (id, price, sub, extra = '') => `<button class="plan ${id === 'lifetime' ? 'best' : ''}" data-plan="${id}">
        <span class="nm">${P[id].name}${extra}</span><span class="bl">${sub}</span>
        <span class="pr">${money(price)}${id === 'weekly' ? '<small>per week</small>' : id === 'lifetime' ? '<small>once</small>' : id === 'pass7' ? '<small>7 days</small>' : '<small>one time</small>'}</span></button>`;
    return `<div class="plans" data-dev="Buttons read prices from /api/me (settings table, per price-test variant). Click → posthog 'clicked_plan_option', then checkout.">
      ${row('lifetime', prices.lifetime, P.lifetime.blurb, '<span class="badge">Best value</span>')}
      ${row('pass7', prices.pass7, "7 days of unlimited writing. <b>Doesn't renew.</b>")}
      ${row('weekly', prices.weekly, `Renews every 7 days. Cancel anytime. ${save > 0 ? `<span class="save">${save}% less than the pass.</span>` : ''}`)}
      ${row('single', prices.single, P.single.blurb)}
    </div>`;
  }
  function bindPlans(root, onPick) {
    root.querySelectorAll('[data-plan]').forEach((b) => b.onclick = () => { api.track('clicked_plan_option', { plan: b.dataset.plan }); onPick(b.dataset.plan); });
  }

  /* ------------------------------------------------ checkout (Stripe, mocked) */
  function checkout(plan, { upgrade = false } = {}) {
    return new Promise(async (resolve) => {
      const me = await api.me();
      if (!me.user) { if (!(await signIn({ reason: 'pay' }))) return resolve(false); }
      const info = await api.startCheckout(plan, { upgrade });
      let paid = false;
      const recurring = info.plan.recurring;
      const disclose = recurring
        ? `<div class="disclose" data-dev="Auto-renew disclosure (required in several US states): price, how often, how to cancel, BEFORE payment. Keep the checkbox.">
            <b>${money(info.amount)} today, then ${money(info.amount)} every 7 days</b> until you cancel.<br>
            Cancel anytime in <b>Account → Plan</b>, two clicks, no email needed. You keep access until the end of the week you paid for.
            <label class="check" style="margin-bottom:0"><input type="checkbox" data-agree> I understand this renews every week until I cancel.</label></div>`
        : plan === 'pass7' ? `<div class="disclose"><b>One charge of ${money(info.amount)}.</b> This pass doesn't renew. After 7 days it just ends.</div>` : '';
      const saved = info.savedCard
        ? `<button class="paybtn apple" data-pay="${esc(info.savedCard.label)}" data-dev="Saved card from first purchase (setup_future_usage). One tap = confirm PaymentIntent with the saved payment_method.">Pay ${money(info.amount)} with ${esc(info.savedCard.label)}</button>
           <button class="link" data-other style="font-size:13px">Use a different payment method</button>`
        : '';
      const methods = `<div data-methods class="${info.savedCard ? 'hidden' : ''}">
          <button class="paybtn apple" data-pay="Apple Pay">Apple Pay</button>
          <button class="paybtn gpay" data-pay="Google Pay">Google Pay</button>
          <button class="paybtn link" data-pay="Link">Pay with <b>link</b></button>
          <div class="or">or pay with card</div>
          <div class="stripe-el" data-dev="Mount Stripe Payment Element here (automatic_payment_methods: enabled). Apple Pay / Google Pay / Link appear automatically when available. Radar is on by default.">[ Stripe Payment Element goes here ]<br>Card number · MM/YY · CVC</div>
          <button class="btn btn-red" style="width:100%" data-pay="card">Pay ${money(info.amount)}</button>
        </div>`;
      const m = modal(`
        <p class="label">Checkout · demo, no real charge</p>
        <h2>${esc(info.plan.name)}${upgrade ? ' upgrade' : ''}</h2>
        <p style="font-family:var(--f-head);font-size:44px;line-height:1;margin:0 0 4px">${money(info.amount)}${recurring ? '<span class="mono muted"> / week</span>' : ''}</p>
        ${upgrade ? '<p class="muted" style="margin:0">What you already spent is taken off the price.</p>' : ''}
        ${disclose}
        <div data-body>${saved}${methods}<div class="err hidden" data-err></div></div>
        <div data-done class="hidden"><p style="font-size:18px"><b>Paid.</b> Unlocking now…</p></div>
        <p class="mono muted" style="margin-top:12px">Secure checkout by Stripe. Receipts go to your email.</p>`,
        { onClose: () => resolve(paid) });
      const other = m.el.querySelector('[data-other]');
      if (other) other.onclick = () => { m.el.querySelector('[data-methods]').classList.remove('hidden'); other.remove(); };
      m.el.querySelectorAll('[data-pay]').forEach((b) => b.onclick = async () => {
        const agree = m.el.querySelector('[data-agree]');
        const err = m.el.querySelector('[data-err]');
        if (agree && !agree.checked) { err.textContent = 'Tick the box to confirm you understand it renews weekly.'; err.classList.remove('hidden'); return; }
        err.classList.add('hidden');
        m.el.querySelectorAll('[data-pay]').forEach((x) => x.disabled = true);
        const label = b.innerHTML; b.innerHTML = '<span class="spin"></span> Processing';
        const res = await api.confirmCheckout(plan, { method: b.dataset.pay, upgrade });
        if (!res.ok) {
          b.innerHTML = label; m.el.querySelectorAll('[data-pay]').forEach((x) => x.disabled = false);
          err.textContent = res.error; err.classList.remove('hidden'); return;
        }
        paid = true;
        m.el.querySelector('[data-body]').classList.add('hidden'); m.el.querySelector('[data-done]').classList.remove('hidden');
        stateChanged();
        setTimeout(() => m.close(), 700);
      });
    });
  }

  /* Paywall as a standalone modal (used outside the chat). */
  async function paywallModal() {
    const me = await api.me();
    return new Promise((resolve) => {
      const m = modal(`<h2>Keep writing</h2><p class="muted">Pick what fits. Lifetime pays for itself fast.</p>${plansHtml(me.prices)}`, { onClose: () => resolve(false) });
      bindPlans(m.el, async (plan) => { m.close(); resolve(await checkout(plan)); });
    });
  }

  /* "You've spent $X. Put it toward lifetime." */
  async function lifetimeOffer() {
    const o = await api.lifetimeOffer();
    if (!o) return false;
    return new Promise((resolve) => {
      const m = modal(`<p class="label">Your pass ended</p><h2>You've spent ${money(o.spent)}. Put it toward lifetime.</h2>
        <p class="muted">Lifetime is normally ${money(o.full)}. We'll take off what you've already paid.</p>
        <button class="plan best" data-up><span class="nm">Lifetime<span class="badge">Your price</span></span><span class="bl"><s>${money(o.full)}</s> minus ${money(o.spent)} already spent</span><span class="pr">${money(o.price)}<small>once</small></span></button>
        <p style="margin:14px 0 0"><button class="link" data-other>See other options</button></p>`, { onClose: () => resolve(false) });
      m.el.querySelector('[data-up]').onclick = async () => { m.close(); resolve(await checkout('lifetime', { upgrade: true })); };
      m.el.querySelector('[data-other]').onclick = async () => { m.close(); resolve(await paywallModal()); };
    });
  }

  /* ------------------------------------------------ share image
     Makes a PNG with the prompt, part of the response, and our name.
     REAL: can stay client-side like this, or render server-side (e.g. @vercel/og)
     so the same image can be the link preview for a shared output page. */
  const SIZES = { tiktok: [1080, 1920, 'TikTok / Reels'], instagram: [1080, 1080, 'Instagram post'], twitter: [1200, 675, 'X / Twitter'] };
  function wrap(ctx, text, maxW) {
    const out = [];
    text.split('\n').forEach((para) => {
      let line = '';
      para.split(' ').forEach((w) => {
        const t = line ? line + ' ' + w : w;
        if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
      });
      out.push(line);
    });
    return out;
  }
  function drawShare(canvas, kind, prompt, text) {
    const [W, H] = SIZES[kind];
    canvas.width = W; canvas.height = H;
    const c = canvas.getContext('2d');
    const pad = Math.round(W * 0.07);
    const s = W / 1080;
    c.fillStyle = '#F5F1E8'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#161412';
    c.font = `${Math.round((kind === 'twitter' ? 64 : 92) * s)}px "Instrument Serif", Georgia, serif`;
    c.fillText('AI But Great', pad, pad + 60 * s);
    c.fillRect(pad, pad + 84 * s, W - pad * 2, 3 * s); c.fillRect(pad, pad + 92 * s, W - pad * 2, 1.5 * s);
    let y = pad + 150 * s;
    c.fillStyle = '#E4251B'; c.font = `600 ${Math.round(22 * s)}px "IBM Plex Mono", monospace`;
    c.fillText('THE PROMPT', pad, y); y += 40 * s;
    c.fillStyle = '#4B463F'; c.font = `${Math.round(34 * s)}px Inter, Arial, sans-serif`;
    wrap(c, '"' + prompt + '"', W - pad * 2).slice(0, 3).forEach((l) => { c.fillText(l, pad, y); y += 46 * s; });
    y += 30 * s;
    c.fillStyle = '#E4251B'; c.font = `600 ${Math.round(22 * s)}px "IBM Plex Mono", monospace`;
    c.fillText('WHAT IT WROTE', pad, y); y += 50 * s;
    c.fillStyle = '#161412'; const fs = kind === 'twitter' ? 34 : 42;
    c.font = `${Math.round(fs * s)}px Fraunces, Georgia, serif`;
    const lh = fs * 1.42 * s;
    const maxLines = Math.floor((H - y - pad - 90 * s) / lh);
    const lines = wrap(c, text.replace(/\n\s*\n/g, '\n'), W - pad * 2);
    lines.slice(0, maxLines).forEach((l, i) => { c.fillText(i === maxLines - 1 && lines.length > maxLines ? l.replace(/\s*\S*$/, ' …') : l, pad, y); y += lh; });
    c.fillStyle = '#E4251B'; c.fillRect(0, H - 70 * s, W, 70 * s);
    c.fillStyle = '#fff'; c.font = `600 ${Math.round(26 * s)}px "IBM Plex Mono", monospace`;
    c.fillText('aibutgreat.com · 3 free responses', pad, H - 25 * s);
  }
  async function share({ prompt, text }) {
    const me = await api.me();
    const ref = me.user ? '?ref=' + me.user.refCode : '';
    const link = location.origin + location.pathname.replace(/[^/]*$/, '') + 'index.html' + ref;
    const m = modal(`<h2>Share this</h2>
      <div class="filters" data-kinds>${Object.entries(SIZES).map(([k, v], i) => `<button class="chip" aria-pressed="${i === 0}" data-k="${k}">${v[2]}</button>`).join('')}</div>
      <canvas data-c style="width:100%;height:auto;max-height:52vh;object-fit:contain;border:1px solid var(--rule);border-radius:8px;background:#fff"></canvas>
      <div class="row-inline" style="margin-top:12px"><button class="btn btn-red" data-dl>Download image</button><button class="btn" data-native>Share…</button><button class="btn" data-link>Copy link</button></div>
      <p class="mono muted" data-dev="Image is drawn on a canvas in the browser. posthog 'shared_output' fires on download/share. Link includes the user's referral code.">Your link includes your referral code. Friends who sign up get 3 free responses, and so do you.</p>`, { wide: true });
    const canvas = m.el.querySelector('[data-c]');
    let kind = 'tiktok';
    const redraw = () => drawShare(canvas, kind, prompt, text);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(redraw);
    m.el.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => {
      kind = b.dataset.k; m.el.querySelectorAll('[data-k]').forEach((x) => x.setAttribute('aria-pressed', x === b)); redraw();
    });
    m.el.querySelector('[data-dl]').onclick = () => {
      const a = document.createElement('a'); a.download = 'aibutgreat-' + kind + '.png'; a.href = canvas.toDataURL('image/png'); a.click();
      api.trackShare(kind);
    };
    m.el.querySelector('[data-native]').onclick = async () => {
      try {
        const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
        const file = new File([blob], 'aibutgreat.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: 'Written by AI But Great', url: link });
        else if (navigator.share) await navigator.share({ text: 'Written by AI But Great', url: link });
        else return copy(link);
        api.trackShare(kind + ':native');
      } catch (e) {}
    };
    m.el.querySelector('[data-link]').onclick = () => { copy(link); api.trackShare('link'); };
  }

  /* ------------------------------------------------ dev notes
     Any element with data-dev="..." gets a blue EVAN note above it when
     "Show dev notes" is on. */
  let devOn = false;
  try { devOn = localStorage.getItem('abg_devnotes') === '1'; } catch (e) {}
  function applyDevNotes() {
    if (!devOn) {
      document.querySelectorAll('.devnote').forEach((n) => n.remove());
      document.querySelectorAll('[data-dev-done]').forEach((n) => n.removeAttribute('data-dev-done'));
      return;
    }
    document.querySelectorAll('[data-dev]:not([data-dev-done])').forEach((el) => {
      const n = document.createElement('div');
      n.className = 'devnote'; n.textContent = el.getAttribute('data-dev');
      el.setAttribute('data-dev-done', '1');
      el.insertAdjacentElement('beforebegin', n);
    });
  }
  let devTimer;
  new MutationObserver(() => { if (devOn) { clearTimeout(devTimer); devTimer = setTimeout(applyDevNotes, 60); } })
    .observe(document.documentElement, { childList: true, subtree: true });

  /* ------------------------------------------------ "For Evan" panel */
  function evanPanel() {
    const fab = document.createElement('button');
    fab.className = 'evan-fab'; fab.textContent = '⚙ For Evan';
    document.body.appendChild(fab);
    let panel = null;
    const fmtEvent = (e) => `<div><span class="k ${e.kind}">${e.kind}</span> ${esc(e.name)} <span style="opacity:.6">${esc(JSON.stringify(e.props))}</span></div>`;
    async function render() {
      if (!panel) return;
      const me = await api.me();
      const e = me.ent, f = api.demo.flags();
      panel.innerHTML = `
        <h4>What this is</h4>
        <div>A clickable prototype. The backend is faked in <b>js/mock-api.js</b>; each function there is one real endpoint. Read <b>site/HANDOFF.md</b> first.</div>
        <h4>Current state</h4>
        <div class="state">user: ${me.user ? esc(me.user.email) : '(anonymous)'}
freeLeft: ${e.freeLeft}   singleCredits: ${e.singleCredits}
lifetime: ${e.lifetime}   passActive: ${e.passActive}${e.passEndsAt ? ' (' + daysLeft(e.passEndsAt) + 'd)' : ''}
autoRenew: ${e.autoRenew}   pastDue: ${e.pastDue}
priceVariant: ${me.variant}   prices: ${esc(JSON.stringify(me.prices))}</div>
        <h4>Toggles</h4>
        <label><input type="checkbox" data-t="dev" ${devOn ? 'checked' : ''}> Show dev notes on the page</label>
        <label><input type="checkbox" data-t="failNextPayment" ${f.failNextPayment ? 'checked' : ''}> Make the next payment fail</label>
        <label><input type="checkbox" data-t="forceEU" ${f.forceEU ? 'checked' : ''}> Pretend I'm in the EU (cookie banner)</label>
        <h4>Jump to a state</h4>
        <button data-a="useUpFree">Use up free responses</button><button data-a="restoreFree">Restore free responses</button>
        ${me.user ? '<button data-a="signOut">Sign out</button>' : '<button data-a="signIn">Sign in</button>'}
        <button data-a="lifetime">Give me lifetime</button><button data-a="weekly">Give me weekly</button><button data-a="pass7">Give me 7-day pass</button>
        <button data-a="ff6">Fast-forward 6 days</button><button data-a="ff8">Fast-forward 8 days</button>
        <button data-a="reset" style="background:#6B1E1E">Reset everything</button>
        <h4>Event log <span style="text-transform:none;letter-spacing:0;color:#9FB3D9">(what would fire for real)</span> <button data-a="clear" style="float:right;margin:0">clear</button></h4>
        <div class="log" data-log>${api.demo.events().slice(0, 80).map(fmtEvent).join('') || '<i>No events yet.</i>'}</div>`;
      panel.querySelectorAll('[data-t]').forEach((c) => c.onchange = () => {
        if (c.dataset.t === 'dev') { devOn = c.checked; try { localStorage.setItem('abg_devnotes', devOn ? '1' : '0'); } catch (x) {} applyDevNotes(); }
        else { api.demo.setFlag(c.dataset.t, c.checked); if (c.dataset.t === 'forceEU' && c.checked) { try { localStorage.removeItem('abg_cookie_choice'); } catch (x) {} cookieBanner(); } }
      });
      panel.querySelectorAll('[data-a]').forEach((b) => b.onclick = async () => {
        const a = b.dataset.a;
        if (a === 'useUpFree') api.demo.useUpFree();
        if (a === 'restoreFree') api.demo.restoreFree();
        if (a === 'signOut') { await api.signOut(); location.reload(); return; }
        if (a === 'signIn') { if (await signIn()) location.reload(); return; }
        if (['lifetime', 'weekly', 'pass7'].includes(a)) { const m2 = await api.me(); if (!m2.user) { toast('Sign in first'); return; } api.demo.giveMePlan(a); }
        if (a === 'ff6') api.demo.fastForward(6);
        if (a === 'ff8') api.demo.fastForward(8);
        if (a === 'reset') { if (confirm('Wipe all demo data and start over?')) { api.demo.resetAll(); location.href = 'index.html'; } return; }
        if (a === 'clear') api.demo.clearEvents();
        stateChanged(); render();
      });
    }
    fab.onclick = () => {
      if (panel) { panel.remove(); panel = null; return; }
      panel = document.createElement('div'); panel.className = 'evan'; document.body.appendChild(panel); render();
    };
    window.addEventListener('abg:event', () => { if (panel) { const log = panel.querySelector('[data-log]'); if (log) log.innerHTML = api.demo.events().slice(0, 80).map(fmtEvent).join(''); } });
    window.addEventListener('abg:state', render);
  }

  /* ------------------------------------------------ boot */
  document.addEventListener('DOMContentLoaded', () => {
    const mh = $('#masthead'); if (mh) masthead(mh, { compact: mh.dataset.compact === '1', current: mh.dataset.current || '' });
    const ft = $('#footer'); if (ft) footer(ft);
    cookieBanner();
    evanPanel();
    applyDevNotes();
  });
  window.addEventListener('abg:state', () => { const mh = $('#masthead'); if (mh) masthead(mh, { compact: mh.dataset.compact === '1', current: mh.dataset.current || '' }); });

  ABG.ui = { toast, copy, money, daysLeft, initials, modal, counter, signIn, plansHtml, bindPlans, checkout, paywallModal, lifetimeOffer, share, esc, stateChanged };
})();
