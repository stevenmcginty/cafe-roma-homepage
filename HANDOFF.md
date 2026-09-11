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

## Style decisions

- Italic is hero-only. Section titles keep the gold word but upright: Bodoni
  italic hairlines were unreadable on phones.
- Section lead copy is weight 400 at 74% opacity for the same reason.

## Next / open

- Nothing blocked. If applications stop arriving, check Vercel function logs
  for `SMTP error` first.
