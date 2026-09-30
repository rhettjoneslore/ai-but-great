/* ==========================================================================
   markdown.js — tiny renderer for Archive posts.
   Supports: frontmatter, ## headings, paragraphs, **bold**, *italic*,
   [links](url), - and 1. lists, > quotes, [1] citation marks.
   REAL: use a proper library at build time (e.g. marked + gray-matter) and
   render each post to its own static page.
   ========================================================================== */
(function () {
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(\d+)\]/g, '<span class="cite">[$1]</span>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => /^(https?:|\/|[\w.-]+\.html)/.test(u) ? `<a href="${u}">${t}</a>` : t);
  }
  function parse(src) {
    let meta = {}, body = src;
    const fm = src.match(/^---\n([\s\S]*?)\n---\n?/);
    if (fm) {
      body = src.slice(fm[0].length);
      fm[1].split('\n').forEach((l) => { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).replace(/\s+#.*$/, '').trim(); });
    }
    const out = [];
    const blocks = body.trim().split(/\n\s*\n/);
    blocks.forEach((b) => {
      const lines = b.split('\n');
      if (/^#{1,3} /.test(b)) { const n = b.match(/^#+/)[0].length; out.push(`<h${n + 1}>${inline(b.replace(/^#+ /, ''))}</h${n + 1}>`); }
      else if (lines.every((l) => /^[-*] /.test(l))) out.push('<ul>' + lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('') + '</ul>');
      else if (lines.every((l) => /^\d+\. /.test(l))) out.push('<ol>' + lines.map((l) => `<li>${inline(l.replace(/^\d+\. /, ''))}</li>`).join('') + '</ol>');
      else if (lines.every((l) => /^> ?/.test(l))) out.push('<blockquote><p>' + inline(lines.map((l) => l.replace(/^> ?/, '')).join(' ')) + '</p></blockquote>');
      else out.push('<p>' + inline(lines.join(' ')) + '</p>');
    });
    return { meta, html: out.join('\n') };
  }
  window.ABG_MD = { parse };
})();
