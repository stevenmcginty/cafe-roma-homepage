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

## Style decisions (2026-09-15 redesign)

- Palette "Espresso Terrazzo" (2026-09-15, replaces the app's mint): espresso
  canvas #0f0c0a, travertine ink #f3ebdf, three accents by role, never mixed
  in one component. Terracotta #b8462c acts (CTAs, closed, focus; small text
  #dc6c4e). Olive #8aa671 is alive (open now, live dots, V/VG/GF). Brass
  #c9a55a only on stars and Est. 1997. One 42px tricolore ribbon in the footer.
  The layout, glass and phones stay from the app design; the app screenshots
  keep their mint, which is fine, they are the app.
- Fonts: Outfit for display, Plus Jakarta Sans for body, Cinzel only for the
  tiny "St Albans · Est. 1997" tag. No italics anywhere. The old Bodoni /
  antique-gold / cream look is gone.
- All styles live in `styles.css` (menu page included, no inline CSS). Phone
  frames are CSS-only and show `images/app-home.png`, `app-menu.png`,
  `app-rewards.png` (393x852 @3x captures of the updated app).
- Menu page: one row per item (name + price), allergens as a quiet text line
  limited to the UK-declared allergens, tap to expand ingredients.

## Next / open

- Nothing blocked. If applications stop arriving, check Vercel function logs
  for `SMTP error` first.
