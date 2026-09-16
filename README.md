# AI But Great

Landing page for **AI But Great** — an AI that writes without sounding like AI. The current essay author is named **Clemens**.

The page collects interest by email ahead of launch, and doubles as the deck we show investors.

## Running it

It's a static site. No build step, no dependencies.

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173

## What's in here

| File | What it is |
| --- | --- |
| `index.html` | The whole page — markup, styles and scripts |
| `essays.js` | The 20 samples used in the Turing test at the top |
| `docs.js` | Full texts for the humanizer-vs-human comparison boxes |
| `pangram-result.png` | Screenshot of the Pangram scan |
| `archive/hong-kong-row.html` | A comparison row removed from the page, kept so it can be restored |

## Sections

1. **Turing test** — 20 samples, each judged Human or AI, graded instantly.
2. **Other AI humanizers** — two blind pairs. Each pair puts a humanizer's response next to a real human-written article on the same subject. Titles open the full text.
3. **Fact retention** — Clemens vs Fable 5.1 on the same Libya prompt.
4. **Pangram** — the scan result.
5. **Code explanations** — photo slots, not yet filled.
6. **"Won't AI improvement eat your business alive?"** — ChatGPT in Dec 2022 vs Fable 5.1 in Sep 2026 on the same prompt.
7. **Overall vision**, **What we do on the backend**, and the email waitlist.

## Editing

**The Turing test answer key** is the `ANSWER_KEY` array near the top of the script in `index.html` — 20 entries of `"human"` or `"ai"`, in sample order.

**The sample essays and comparison texts** live in `essays.js` and `docs.js`. When you change either file, bump the version on its `<script src="...?v=N">` tag in `index.html`, or browsers will keep serving the old copy from cache. Same for `pangram-result.png`.

**Photo placeholders** are the dashed boxes labelled "Photo" in the code-explanation section. Replace each `<div class="ph">` with an `<img>`.

## Still to do

- The email waitlist is a `mailto:` link, not a form. No signups are stored anywhere.
- The code-explanation section is all placeholders.
- The Pangram screenshot shows the account's remaining credits in the top right corner.

## A note on the comparison texts

`docs.js` contains the full text of three Substack articles by their respective authors, used here to compare against AI output. They are other people's work. Keep this repo private, or replace them with excerpts before making it public.
