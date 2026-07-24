# Analytics — how to switch it on

Everything is already wired. All that's missing are two IDs and one dashboard toggle.
**One file to edit: `analytics.js`, the `CONFIG` block at the top.**

---

## 1. Vercel Web Analytics — do this first (2 minutes, no IDs)

This is the quickest win and it needs no code changes at all.

1. Go to <https://vercel.com/dashboard> → project **cafe-roma-homepage**
2. Open the **Analytics** tab → **Enable Web Analytics**
3. Redeploy (or just push — the next deploy picks it up)

You immediately get, in the Vercel dashboard:

- Visitors and page views, by day
- **Referrers** — where they came from (Google, Instagram, direct, etc.)
- **Countries / cities**
- **Devices and browsers** — mobile vs desktop split
- Top pages (home vs `/menu`)

It is cookieless, so it records **every** visitor — including the ones who ignore
the cookie banner. Free tier covers 2,500 events/month, which is plenty for a
single-site cafe.

Optional: on the same tab, enable **Speed Insights**, then set
`VERCEL_SPEED: true` in `analytics.js`.

---

## 2. Google Analytics 4 — the full picture (10 minutes)

1. Go to <https://analytics.google.com> → **Admin** → **Create** → **Property**
2. Name it "Cafe Roma", timezone **United Kingdom**, currency **GBP**
3. Create a **Web** data stream for `https://caferoma.app`
4. Copy the **Measurement ID** — it looks like `G-ABC1234XYZ`
5. In `analytics.js`, replace:

   ```js
   GA4_ID: 'G-XXXXXXXXXX',
   ```

   with your real ID.

GA4 gives you acquisition channels, returning vs new visitors, engagement time,
and all the custom events listed below.

---

## 3. Microsoft Clarity — watch real sessions (5 minutes, free, no limits)

This is the one that answers "what are people *actually* doing on my site" —
it records anonymised sessions and builds heatmaps.

1. Go to <https://clarity.microsoft.com> → sign in with a Microsoft account
2. **New project** → name "Cafe Roma", site URL `caferoma.app`
3. Copy the **Project ID** (a short string like `q7x3k9abcd`)
4. In `analytics.js`, replace:

   ```js
   CLARITY_ID: 'XXXXXXXXXX',
   ```

   with your real ID.

---

## What gets tracked

GA4 and Clarity only load **after** a visitor accepts the cookie banner.
Vercel is cookieless and always on. The banner only appears once at least one of
GA4 / Clarity has a real ID — while both are placeholders, visitors see no banner.

Custom events fired on both pages:

| Event | Fires when | Useful for |
|---|---|---|
| `click_sign_in` | Any "Sign In to Loyalty" button | Loyalty funnel top |
| `click_order_online` | Any "Order Online" button | Order funnel top |
| `click_menu` | Menu link / nav / dock | Menu demand |
| `click_phone` | Tapping the phone number | Real call volume |
| `click_directions` | "Get Directions" / map links | Footfall intent |
| `click_social` | Instagram / Facebook / TikTok icons | Which channel people want |
| `dock_tap` | Mobile bottom dock (`menu`/`order`/`call`/`directions`) | Mobile behaviour |
| `day_timeline_swipe` | Swiping the "A Day at Roma" timeline | Is the timeline worth keeping |
| `menu_category` | Tapping a category chip on `/menu` | Which food people look for |
| `allergen_filter_open` | Opening the allergen filter | Allergy demand |
| `scroll_depth` | 25 / 50 / 75 / 100 % of the page | Where people drop off |
| `visit_context` | Once per visit, `shop_open: true/false` | Are people browsing when shut? |
| `consent` | Accept / decline | Banner conversion |

---

## Reading it day to day

- **"Who's coming and where from"** → Vercel Analytics tab, or GA4 →
  *Reports → Acquisition → Traffic acquisition*
- **"What are they doing"** → Clarity → *Recordings* and *Heatmaps*
- **"Is it turning into business"** → GA4 → *Reports → Engagement → Events*,
  and watch `click_order_online`, `click_phone`, `click_directions`

---

## Not yet done: feeding the KoraOS widget

You mentioned pushing website traffic into the coffee-shop widget harness so it
shows alongside revenue. That is a separate build and it is **not** in this
change — see the note at the end of the handover. The short version: doing it via
Firestore writes on every page view would breach the cost rule in the KoraOS
project, so it needs a batched/aggregated approach (one small daily rollup doc,
or reading Vercel's API server-side). Say the word and I'll build it.
