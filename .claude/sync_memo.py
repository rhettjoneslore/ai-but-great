"""Rebuild the memo section of index.html from the working Google Doc export.

Usage: python3 .claude/sync_memo.py <exported-doc.txt>
Headings, numbered lists, italics (*word*) and the known links are reapplied.
"""
import re, sys, html as ht

HEADINGS = {"The first product:", "B2B:", "Here’s how the core operation works:",
            "How the B2B product works (stage 1):", "This can be a massive company:",
            "This can be a massive company (stage 2):", "About me:"}
# phrase to link -> url. Phrases must be unique enough to match once.
LINKS = [
    ("unlikely in the foreseeable future", "https://pangram.substack.com/p/no-llms-dont-just-mimic-human-text"),
    ("average spend-per-ticket", "https://www.ringly.io/blog/ecommerce-customer-service-cost-per-contact"),
    ("that just does the work for them", "https://sequoiacap.com/article/services-the-new-software"),
    ("Cased, which my cofounder", "https://ridecased.com/", "Cased"),
    ("do the most good", "https://www.azquotes.com/quote/552298"),
    ("done here.", "https://rhettjones.carrd.co/", "here"),
]
ITALIC_PHRASES = [("we just do the email", "just do")]

def fmt(t):
    return re.sub(r'\*([^*]+)\*', r'<em>\1</em>', ht.escape(t, quote=False))

def build(lines):
    out, i = [], 0
    while i < len(lines):
        l = lines[i]
        if i == 0 and l == "Memo":
            out.append('      <p class="memo-mark">Memo</p>')
        elif i == 1:
            out.append("      <h1>" + fmt(l) + "</h1>")
        elif l in HEADINGS:
            out.append("      <h2>" + fmt(l) + "</h2>")
        elif re.match(r'^\d+\.\s', l):
            items = []
            while i < len(lines) and re.match(r'^\d+\.\s', lines[i]):
                items.append("        <li>" + fmt(re.sub(r'^\d+\.\s*', '', lines[i])) + "</li>")
                i += 1
            out.append('      <ol class="pipeline">'); out.extend(items); out.append("      </ol>")
            continue
        elif l.startswith("rhettiro@gmail.com"):
            out.append("      <p>" + fmt(l).replace("rhettiro@gmail.com",
                       '<a href="mailto:rhettiro@gmail.com">rhettiro@gmail.com</a>', 1) + "</p>")
        else:
            out.append("      <p>" + fmt(l) + "</p>")
        i += 1
    memo = "\n".join(out)

    for context, word in ITALIC_PHRASES:
        if context in memo:
            memo = memo.replace(context, context.replace(word, "<em>" + word + "</em>"), 1)
    for entry in LINKS:
        phrase, url = entry[0], entry[1]
        anchor = entry[2] if len(entry) > 2 else phrase
        idx = memo.find(phrase)
        if idx < 0:
            print("  ! link phrase not found, skipped:", phrase)
            continue
        start = memo.find(anchor, idx)
        memo = memo[:start] + '<a href="' + url + '" target="_blank" rel="noopener">' + anchor + "</a>" + memo[start + len(anchor):]
    return memo

def main(src):
    lines = [re.sub(r'\s+', ' ', l).strip() for l in open(src, encoding="utf-8-sig") if l.strip()]
    memo = build(lines)
    html = ('<main class="wrap memo">\n\n  <section class="memo-start">\n    <div class="stack col">\n'
            + memo + "\n    </div>\n  </section>\n\n</main>\n")
    s = open("index.html", encoding="utf-8").read()
    s = s.replace(re.search(r'<main class="wrap memo">.*?</main>\n', s, re.S).group(0), html, 1)
    open("index.html", "w", encoding="utf-8").write(s)

    page = re.sub(r'<script.*?</script>|<style.*?</style>|<!--.*?-->', ' ', s, flags=re.S)
    text = re.sub(r'\s+', ' ', ht.unescape(re.sub(r'<[^>]+>', '', page))).strip()
    missing = [l for l in lines if re.sub(r'^\d+\.\s*', '', l).replace("*", "") not in text]
    print("doc lines: %d | missing: %d" % (len(lines), len(missing)))
    for m in missing:
        print("   MISSING:", m[:100])
    print("links:", re.findall(r'<a href="([^"]+)"[^>]*>([^<]+)</a>', memo))

main(sys.argv[1])
