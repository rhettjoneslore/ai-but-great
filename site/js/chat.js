/* ==========================================================================
   chat.js — the chat box. Mounted inline in the homepage hero after the
   first prompt, and full-page on chat.html (with history).

   The free flow, as the user sees it:
     response 1  → no account needed
     response 2  → Google sign-in first (one tap), then it writes
     response 3  → counter says "last free response"
     response 4  → full answer is written; only paragraph 1 shows; the rest is
                   blurred under the payment options; paying unblurs the SAME text
   The rules themselves are enforced in mock-api.js → generate().
   ========================================================================== */
(function () {
  const api = ABG.api, ui = ABG.ui, F = window.ABG_FORMATS;
  const esc = F.esc;

  // Decoy text for the blurred area. The real text is NOT sent until they pay.
  const DECOY = 'Lorem ipsum stands in here because the real words stay on the server until you unlock them, so nobody can read the answer by opening developer tools and removing the blur from the page.\n\nThe rest of your response is already written and saved. When you pay it appears right away, exactly as it was written, not rewritten or regenerated.\n\nThis block is only here to look like text.';

  function mount(root, opts = {}) {
    const full = !!opts.full;
    let conversationId = opts.conversationId || null;
    let busy = false;

    root.innerHTML = `<div class="chat">
      <div class="chat-head">
        <span class="label" data-title>${full ? 'New chat' : 'Your draft'}</span>
        <span class="counter" data-counter data-dev="Counter from /api/me entitlements. Copy: '2 free responses left' → 'Last free response' → paywall.">…</span>
      </div>
      <div class="chat-msgs" data-msgs aria-live="polite"></div>
      <form class="chat-compose" data-form>
        <textarea rows="1" data-input placeholder="Ask for changes, or something new…" aria-label="Message"></textarea>
        <button class="btn btn-red" type="submit" data-send>Write</button>
      </form>
      ${full ? '' : '<div style="padding:0 12px 10px" class="mono"><a href="chat.html" data-full>Open full chat with history →</a></div>'}
    </div>`;
    const msgs = root.querySelector('[data-msgs]');
    const input = root.querySelector('[data-input]');
    const form = root.querySelector('[data-form]');
    const counterEl = root.querySelector('[data-counter]');
    const fullLink = root.querySelector('[data-full]');

    async function refreshCounter() {
      const me = await api.me();
      const c = ui.counter(me.ent);
      counterEl.textContent = c.text;
      counterEl.className = 'counter ' + c.cls;
      return me;
    }
    window.addEventListener('abg:state', refreshCounter);

    const scroll = () => {
      msgs.scrollTop = msgs.scrollHeight;
      if (full) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    function addUser(text) {
      const d = document.createElement('div'); d.className = 'msg-user'; d.textContent = text; msgs.appendChild(d); scroll();
    }
    function addTyping() {
      const d = document.createElement('div'); d.className = 'msg-ai'; d.innerHTML = '<div class="typing"><i></i><i></i><i></i></div>'; msgs.appendChild(d); scroll(); return d;
    }
    function metaLine(r) { return `${r.words.toLocaleString()} words · ${(r.ms / 1000).toFixed(1)}s`; }

    function toolsHtml(r) {
      return `<div class="tools"><span class="meta" data-dev="Store words per response + add to the user's total (unit economics: ~$1 per 3,000 words).">${metaLine(r)}</span>
        <button class="btn btn-sm btn-ghost" data-copy>Copy</button>
        <button class="btn btn-sm" data-share data-dev="Share → PNG with prompt + snippet + logo, in TikTok / Instagram / X sizes.">Share</button></div>`;
    }
    function bindTools(el, prompt, text) {
      el.querySelector('[data-copy]').onclick = () => ui.copy(text);
      el.querySelector('[data-share]').onclick = () => ui.share({ prompt, text });
    }

    async function streamInto(el, text) {
      const words = text.split(/(\s+)/);
      const box = el.querySelector('.txt');
      const step = Math.max(2, Math.ceil(words.length / 60));
      for (let i = 0; i < words.length; i += step) {
        box.innerHTML = F.paras(words.slice(0, i + step).join(''));
        await new Promise((r) => setTimeout(r, 16));
      }
      box.innerHTML = F.paras(text);
    }

    function renderAi(el, prompt, r, { animate = false } = {}) {
      if (!r.locked) {
        el.innerHTML = `<div class="txt"></div>`;
        const finish = () => { el.insertAdjacentHTML('beforeend', toolsHtml(r)); bindTools(el, prompt, r.text); };
        if (animate) return streamInto(el, r.text).then(finish);
        el.querySelector('.txt').innerHTML = F.paras(r.text); finish();
        return Promise.resolve();
      }
      return renderLocked(el, prompt, r);
    }

    async function renderLocked(el, prompt, r) {
      const me = await api.me();
      const offer = await api.lifetimeOffer();
      const offerHtml = offer ? `<button class="plan best" data-upgrade style="margin-bottom:10px"><span class="nm">Lifetime<span class="badge">Your price</span></span>
          <span class="bl">You've spent ${ui.money(offer.spent)}. Put it toward lifetime.</span><span class="pr">${ui.money(offer.price)}<small>once</small></span></button>` : '';
      el.innerHTML = `<div class="txt">${F.paras(r.preview)}</div>
        <div class="locked" data-dev="Server sent ONLY paragraph 1. The blurred text is decoy. After payment call POST /api/responses/:id/unlock and show the same stored text.">
          <div class="blur" aria-hidden="true">${F.paras(DECOY)}</div>
          <div class="over">
            <h3>The rest is written. Unlock it.</h3>
            <p class="muted" style="margin:0 0 12px">You've used your free responses. Pick one and it shows up instantly, no rewrite.</p>
            ${offerHtml}${ui.plansHtml(me.prices)}
          </div>
        </div>`;
      const pay = async (plan, upgrade) => {
        const paid = await ui.checkout(plan, { upgrade });
        if (!paid) return;
        const res = await api.unlockResponse(r.id);
        if (res.ok) {
          el.innerHTML = `<div class="txt" style="transition:filter .5s, opacity .5s;filter:blur(6px);opacity:.6"></div>`;
          el.querySelector('.txt').innerHTML = F.paras(res.response.text);
          requestAnimationFrame(() => requestAnimationFrame(() => { const t = el.querySelector('.txt'); t.style.filter = 'none'; t.style.opacity = '1'; }));
          el.insertAdjacentHTML('beforeend', toolsHtml(res.response)); bindTools(el, prompt, res.response.text);
          refreshCounter();
        } else ui.toast('Payment went through but unlock failed. (Would retry.)');
      };
      ui.bindPlans(el, (plan) => pay(plan, false));
      const up = el.querySelector('[data-upgrade]'); if (up) up.onclick = () => { api.track('clicked_plan_option', { plan: 'lifetime_upgrade' }); pay('lifetime', true); };
    }

    function notice(html, cls = '') {
      const d = document.createElement('div'); d.className = 'notice ' + cls; d.innerHTML = html; msgs.appendChild(d); scroll(); return d;
    }

    async function generate(prompt) {
      const typing = addTyping();
      const res = await api.generate({ prompt, conversationId });
      if (res.status === 'needs_signin') {
        typing.remove();
        const me = await api.me();
        const reason = me.ent.freeLeft > 0 ? 'second' : 'pay';
        const n = notice(reason === 'second'
          ? `<b>Sign in to get your next response.</b> It's still free. <button class="btn btn-sm btn-red" data-si style="margin-top:8px">Continue with Google</button>`
          : `<b>Sign in to keep going.</b> You've used your free responses on this device. <button class="btn btn-sm btn-red" data-si style="margin-top:8px">Continue with Google</button>`);
        const go = async () => { if (await ui.signIn({ reason })) { n.remove(); await generate(prompt); } };
        n.querySelector('[data-si]').onclick = go;
        go();
        return;
      }
      if (res.status === 'rate_limited') {
        typing.remove();
        notice(res.reason === 'minute'
          ? `<b>Slow down a little.</b> You can send up to 5 requests a minute. Try again in ${res.retryIn || 60}s.`
          : `<b>That's the daily max.</b> You've hit today's limit. It resets at midnight.`, 'red');
        return;
      }
      conversationId = res.conversationId;
      if (fullLink) fullLink.href = 'chat.html?c=' + conversationId;
      opts.onConversation && opts.onConversation(conversationId);
      await renderAi(typing, prompt, res.response, { animate: true });
      await refreshCounter();
    }

    async function send(text) {
      text = (text || '').trim();
      if (!text || busy) return;
      busy = true; root.querySelector('[data-send]').disabled = true;
      try {
        if (!localStorage.getItem('abg_typed_first')) { localStorage.setItem('abg_typed_first', '1'); api.track('typed_first_prompt', { length: text.length }); }
      } catch (e) {}
      addUser(text);
      input.value = ''; autosize();
      try { await generate(text); } finally { busy = false; root.querySelector('[data-send]').disabled = false; input.focus({ preventScroll: true }); }
    }

    async function load(id) {
      const c = await api.getConversation(id);
      if (!c) return false;
      conversationId = c.id;
      root.querySelector('[data-title]').textContent = c.title;
      msgs.innerHTML = '';
      let lastPrompt = '';
      for (const m of c.messages) {
        if (m.role === 'user') { addUser(m.text); lastPrompt = m.text; }
        else { const d = document.createElement('div'); d.className = 'msg-ai'; msgs.appendChild(d); await renderAi(d, lastPrompt, m.response); }
      }
      return true;
    }

    function autosize() { input.style.height = 'auto'; input.style.height = Math.min(180, input.scrollHeight) + 'px'; }
    input.addEventListener('input', autosize);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
    form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });

    refreshCounter();
    return { send, load, focus: () => input.focus(), get conversationId() { return conversationId; } };
  }

  ABG.Chat = { mount };
})();
