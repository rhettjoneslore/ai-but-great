# AI But Great: handoff for Evan

This folder is a **clickable prototype of the whole site**. Every screen in the spec exists and works end to end, but nothing real is behind it:

- The "AI" returns placeholder text (or the showcase text if you use a showcase prompt).
- Stripe, Google sign-in, Loops, Twilio, PostHog and FingerprintJS are all faked.
- All data lives in the browser's localStorage.

Your job is to keep the screens and replace the fake parts. The source spec is the Google Doc "How to Make the Site".

## Run it

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173/site/ (serve from the repo root, or from `site/` and drop the `/site`).

## The two tools that make this easy to read

1. **The "⚙ For Evan" button** (bottom right of every page). It shows:
   - the current user's entitlements (free left, pass, auto-renew, lifetime)
   - an **event log** of everything that would fire for real: PostHog events, Stripe calls and webhooks, Loops contact updates and emails, Twilio texts
   - buttons to jump states: use up free responses, give yourself a plan, fast-forward a pass by 6 or 8 days, make the next payment fail, pretend to be in the EU, reset everything
2. **"Show dev notes"** (a toggle in that panel). Blue `EVAN →` notes appear on the page next to each piece, saying what the real version must do.

## Where the rules live

`js/mock-api.js` is the fake backend. **Each function on `ABG.api` is one real endpoint**, with a `REAL:` comment describing it. If you swap each function body for a `fetch()` and keep the return shape, the UI shouldn't need to change.

| Mock function | Real endpoint | Notes |
| --- | --- | --- |
| `me()` | `GET /api/me` | user, entitlements, this visitor's prices |
| `signInWithGoogle()` | Google OAuth | scopes `openid email profile` only. Merge anonymous chats, `posthog.identify()` |
| `generate()` | `POST /api/generate` | **the gate**: rate limit → paid access → single credits → free (1st needs no account, 2nd and 3rd need sign-in) → paywall |
| `unlockResponse(id)` | `POST /api/responses/:id/unlock` | returns the SAME stored text after payment |
| `listConversations()`, `getConversation()` | `GET /api/conversations[/:id]` | chat history |
| `startCheckout(plan)` | `POST /api/checkout` | PaymentIntent (or Subscription for weekly), `automatic_payment_methods`, `setup_future_usage` |
| `confirmCheckout()` | Stripe Elements on the client | then Stripe calls the webhook |
| `stripeWebhook()` (internal) | `POST /api/stripe/webhook` | **the only place paid access changes** (plus admin grants) |
| `cancelAutoRenew()` | `POST /api/subscription/cancel` | `cancel_at_period_end: true` |
| `lifetimeOffer()` | part of `/api/me` | "You've spent $X. Put it toward lifetime." |
| `referral()` | `GET /api/referral` | both sides get 3 free responses |
| `setMarketing()` | `PATCH /api/me` | then push to Loops |
| `smsOptIn()` | `POST /api/sms-optin` | store consent text, time, IP (from the request) |
| `joinWaitlist()` | `POST /api/waitlist` | reusable per launch |
| `admin.*` | `/api/admin/*` | server must check `role === 'admin'` |

## Rules that must be enforced on the server

The prototype does these in the browser only because it has no server. On the real site, none of them can trust the browser.

1. **Free responses are counted per device + IP, not per account.** Use FingerprintJS `visitorId` + IP. The mock keeps `devices[deviceId].freeUsed`. Referral and admin bonuses are per account on top of that.
2. **Locked responses never reach the browser.** On response 4 with no plan, write the whole answer, store it, and send only the first paragraph. The blurred part on screen is decoy text. After payment, `unlock` returns the stored text: no rewrite.
3. **Paid access changes only from Stripe webhooks** (`payment_intent.succeeded`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`) or admin grants. Verify webhook signatures.
4. **Rate limits:** about 5 responses a minute for everyone and a daily max for pass and lifetime users. Both numbers are in settings.
5. **Prices come from settings, never code.** Two versions (A/B) for price tests. A visitor is assigned once and keeps their version forever (store it on the anonymous ID, copy it to the user at signup).
6. **Word counts:** store words per response and a running total per user. Admin → Numbers shows revenue per 3,000 words against the $1 target.

## The entitlements record

One row per user, exactly as the spec asks:

```
freeLeft (derived: device base + account bonus)
singleCredits        // bought "just this response"
passEndsAt           // 7-day pass or weekly plan
autoRenew            // weekly plan on/off
lifetime             // yes/no
pastDue              // last renewal failed
```

## Screens

| Page | What it covers from the spec |
| --- | --- |
| `index.html` | masthead, hero with rotating placeholder, inline chat, 20-example showcase (filters, read full, ChatGPT toggle, Try this, swipe row on phones), videos (hover / scroll-to-play), Archive teaser, text-for-discount box, footer |
| `chat.html` | full chat with history |
| `account.html` | plan, cancel auto-renew (self-serve), lifetime offer, purchases, usage, referral link, email and text preferences |
| `admin.html` | user lookup, grants, refunds, prices + price test + limits, contacts with filters + CSV export, content editing, unit economics |
| `archive.html`, `post.html` | The Archive: satire news and encyclopedia parodies, each with its prompt shown and "our AI wrote this" |
| `waitlist.html` | reusable waitlist, move up by inviting (`?launch=name&title=...`) |
| `terms.html`, `privacy.html`, `refund.html` | outlines only; a lawyer writes the real text |

Shared modals (in `js/common.js`): Google sign-in, paywall options, Stripe checkout (with the auto-renew disclosure and required checkbox), share image (canvas, three sizes), lifetime offer, EU cookie banner.

## Content the team edits without a dev

- `content/examples.js`: the 20 showcase examples. First 6 are the strongest. **The ChatGPT answers are placeholders.** Paste ChatGPT's real answers before launch.
- `content/videos.js`: paste Mux or Cloudflare Stream URLs and the original TikTok/Instagram links.
- `posts/*.md` + `posts/index.json`: Archive posts. The admin panel shows a template.

On the real site, examples and videos should come from a CMS or the database (admin → Content already has the editing UI). Posts should render at build time to `/archive/{slug}` with their own title, description and share image, and be added to `sitemap.xml`.

## Integrations checklist

- [ ] **Model**: replace `fakeWrite()` in `mock-api.js` with the humanized model, server-side.
- [ ] **Google OAuth**: name, email, photo only.
- [ ] **Stripe**: Payment Element with Apple Pay, Google Pay, Link. Save the card after the first payment. Subscriptions for weekly. Radar on. Webhook handler.
- [ ] **FingerprintJS**: device ID for free-response counting.
- [ ] **PostHog** (site + server): events listed below, `identify` at sign-in, first-touch source on every event, session recording with inputs masked, Stripe revenue sent in, the three dashboards.
- [ ] **Loops**: contact sync both ways (we're the master; Loops' unsubscribe webhook writes back). Emails: receipt, pass ends in 24h, pass ended, failed payment, upcoming renewal, one "you didn't finish" email.
- [ ] **Twilio**: SMS with the consent record. Loops doesn't do SMS.
- [ ] **Sentry** + an uptime monitor.
- [ ] **Geo** for the EU cookie banner (the prototype guesses from the timezone).
- [ ] **Share-link preview image** (`og:image`) for the homepage and each post.

## PostHog events already wired in the prototype

All of these appear in the event log:

`landed`, `typed_first_prompt`, `got_first_response`, `saw_signin_prompt`, `signed_in`, `got_response_2`, `got_response_3`, `saw_payment_screen`, `clicked_plan_option`, `started_checkout`, `paid`, `bought_again`, `payment_failed`, `cancelled`, `sent_referral`, `shared_output`, `price_variant_assigned`, `sms_opt_in`, `joined_waitlist`, plus homepage extras (`clicked_try_this`, `read_full_example`, `viewed_chatgpt_compare`, `video_tapped`, `shared_video`, `shared_post`).
