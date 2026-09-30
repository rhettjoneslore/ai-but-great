/* ==========================================================================
   formats.js — draws each example in its real-world format.
   Generic look-alikes only: no real app logos or names.
   ========================================================================== */
(function () {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const paras = (s) => s.split(/\n\s*\n/).map((p) => '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>').join('');
  const initials = (n) => n.replace(/\(.*?\)/g, '').replace(/[^\p{L}\s]/gu, '').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const render = {
    email(o) {
      return `<div class="f-email">
        <div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span class="t">New message</span></div>
        <div class="hdr"><div>To: <b>${esc(o.to)}</b></div><div>Subject: <b>${esc(o.subject)}</b></div></div>
        <div class="body">${esc(o.body)}</div></div>`;
    },
    texts(o) {
      const firstNew = o.messages.findIndex((m) => !m.context);
      const b = o.messages.map((m, i) => (i === firstNew && firstNew > 0 ? '<div class="stamp">Today 9:41 PM</div>' : '') +
        `<div class="bubble ${m.me ? 'me' : 'them'} ${m.context ? 'ctx' : ''}">${esc(m.text)}</div>`).join('');
      return `<div class="f-texts"><div class="top"><div class="av">${esc(initials(o.contact))}</div><div class="n">${esc(o.contact)}</div></div>
        ${firstNew > 0 ? '<div class="stamp">Earlier</div>' : '<div class="stamp">Today 9:41 PM</div>'}${b}<div class="delivered">Delivered</div></div>`;
    },
    page(o) {
      return `<div class="f-page">${o.title ? `<h4>${esc(o.title)}</h4>` : ''}${paras(o.body)}</div>`;
    },
    linkedin(o) {
      return `<div class="f-post"><div class="who"><div class="av">${esc(initials(o.name))}</div><div><div class="nm">${esc(o.name)}</div><div class="hl">${esc(o.headline)} · 2d</div></div></div>
        <div class="body">${esc(o.body)}</div><div class="react"><span>👍 ❤️ 1,284</span><span>212 comments</span></div></div>`;
    },
    thread(o) {
      return `<div class="f-thread">${o.posts.map((p) => `<div class="tw"><div class="av">${esc(initials(o.name))}</div>
        <div><div class="nm">${esc(o.name)} <span class="hd">@${esc(o.handle)}</span></div><div class="tx">${esc(p)}</div></div></div>`).join('')}</div>`;
    },
    instagram(o) {
      return `<div class="f-insta"><div class="who"><span class="av"><i></i></span>${esc(o.handle)}</div>
        <div class="img"><span>[photo: ${esc(o.image)}]</span></div><div class="icons">♡ ◯ ➤</div>
        <div class="cap"><b>${esc(o.handle)}</b>${esc(o.caption)}</div></div>`;
    },
    profile(o) {
      return `<div class="f-profile"><div class="ph"><b>${esc(o.name)}, ${esc(o.age)}</b></div><div class="det">${esc(o.details)}</div>
        ${o.prompts.map((p) => `<div class="pr"><div class="q">${esc(p.q)}</div><div class="a">${esc(p.a)}</div></div>`).join('')}</div>`;
    },
    listing(o) {
      return `<div class="f-listing"><div class="img"></div><div class="in"><h5>${esc(o.title)}</h5>
        <div class="meta">${esc(o.meta)} · ★ ${esc(o.rating)}</div><div class="body">${paras(o.body)}</div></div></div>`;
    },
  };

  /* The words the AI actually wrote, as plain text (for word counts,
     share images and the chat demo). */
  function plainText(ex) {
    const o = ex.output;
    switch (ex.format) {
      case 'email': return 'Subject: ' + o.subject + '\n\n' + o.body;
      case 'texts': return o.messages.filter((m) => !m.context).map((m) => m.text).join('\n\n');
      case 'page': return o.body;
      case 'linkedin': return o.body;
      case 'thread': return o.posts.join('\n\n');
      case 'instagram': return o.caption;
      case 'profile': return o.prompts.map((p) => p.q + '\n' + p.a).join('\n\n');
      case 'listing': return o.title + '\n\n' + o.body;
    }
    return '';
  }
  const words = (s) => (s.match(/\S+/g) || []).length;

  window.ABG_FORMATS = { render: (ex) => (render[ex.format] || render.page)(ex.output), plainText, words, esc, paras };
})();
