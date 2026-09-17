# HANDOFF — cafe-roma-homepage

Live site: https://caferoma.app (Vercel project `cafe-roma-homepage`, DNS on Vercel).
The `roma-2026/` folder is a separate local-only redesign; nothing deploys from it.

## Careers form (2026-09-11)

- Section `#careers` on the homepage. Fields: name, email, phone, mobile, cover
  note, CV (PDF/Word, 4 MB max). JS in `script.js` validates and POSTs to
  `/api/apply`; on success the form is replaced by a thank-you.
- `api/apply.mjs` is a Vercel function. It sends the application through the
  cafe's own Gmail (SMTP, nodemailer) to `CAREERS_TO`, CV attached, Reply-To
  set to the applicant. Honeypot field `website` silently drops bots.
- Env vars are set in Vercel (Production + Preview): `GMAIL_USER`,
  `GMAIL_APP_PASSWORD`, `CAREERS_TO`. The app password is the same one KoraOS
  uses for receipts: Firestore project `cafe-roma-pos`, database `koraos`,
  doc `system/email_config`. If Google ever revokes it, make a new app
  password on the stalbanscaferoma Google account and update both places.
- Decided against: Resend (needs an account; bot check blocks signup from a
  script) and FormSubmit (needs an "Activate Form" click that never happened;
  one real application on 2026-09-11 13:17 was lost that way).

## Style decisions (2026-09-17 redesign, "Peacock & Marigold")

- Palette is taken from the real room and shopfront. Cream paper canvas
  `#fbf6ec` with ink `#0e2a31`; deep peacock-teal bands `#0b3540` (story,
  reviews) and `#072831` (hero base, footer); one accent, marigold gold
  `#e8a93a` (buttons, stars, seal, "now" markers; as text on cream it is
  `#8f5d10`, on teal `#f2b84b`). Leaf green `#1f7a48` only for "open now"
  and diet tags; orchid pink `#c2418a` only as a small icon tint. No red or
  terracotta anywhere except the 44px Italian tricolore in the footer.
- Dark surfaces re-theme every component through CSS variables: `.hero`,
  `.band`, `.footer` and the nav while it floats over the hero photo. A page
  with no photo hero puts `nav-light` on the header (menu page does).
- Fonts: Fraunces for display (italic gold for one phrase per heading), Plus
  Jakarta Sans for body, Cinzel for the tiny "St Albans · Est. 1997" tag and
  the R seal. Arched photo frames echo the cafe's gold mirrors.
- Photos, all graded copies from `images/graded/` (see its NOTES.md):
  `interior-graded.jpg` (real, story arch), `interior-counter-graded.jpg`
  (real, story polaroid), `interior-mirrors-graded.jpg` (real, reviews tile),
  `interior-lights-graded.jpg` (real, menu page hero), `exterior-front-graded.jpg`
  (real, visit section). `images/exterior.jpg` is the hero, ungraded.
- Stock photos: `coffee-graded.jpg` and `pastries-graded.jpg` sit together in
  the "At the counter" block (`.counter-photos`, both 4:3). When real photos
  arrive, replace those two files with 1200x900 crops and update the two alt
  texts in `index.html`. Their captions never say they were taken at the cafe.
- All styles live in `styles.css` (menu page included, no inline CSS). Phone
  frames are CSS-only and show `images/app-home.png`, `app-menu.png`,
  `app-rewards.png` (393x852 @3x captures of the updated app).
- Menu page: one row per item (name + price), allergens as a quiet text line
  limited to the UK-declared allergens, tap to expand ingredients.

## Next / open

- Nothing blocked. If applications stop arriving, check Vercel function logs
  for `SMTP error` first.

## App showcase (2026-09-17)

- The `#app` section is an interactive walk-through of the customer app: four
  beats (scan at the table, browse and order, choose collection or table, paid
  with points and stamps). It auto-plays when the section is on screen, pauses
  off screen, and steps 01-04 are real buttons. Under
  `prefers-reduced-motion: reduce` it holds a complete static view. Logic is
  `showcase()` in `script.js`.
- Phone screens come from `images/app/`. The captures are from a signed-in
  session, so `images/app/sanitise.py` paints out the owner's name and points
  balance; it works from `*-raw.png` copies, which are gitignored along with
  the unused captures and `images/app/from-owner/` (owner's own phone
  screenshots, kept locally as reference only).
- `images/app-rewards.png` (right-hand phone, pre-existing) still shows real
  balances: 460 points, 64 visits, 7/10 stamps. No name. Replace it if that
  matters.
- The order sheet beat is drawn in CSS, not a screenshot. No real QR code and no
  member code reaches the page.
- Photos to swap when real food photos arrive: `images/coffee-graded.jpg` and
  `images/pastries-graded.jpg`.
