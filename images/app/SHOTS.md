01-home.png — https://koraos.co.uk/cafe-roma/menu (Home tab) — dashboard: digital pass QR/till code, points balance, "Order Food & Drink" entry, Past Orders / Rewards / Take Away tiles, Your Usuals. Reached signed in (see DEVIATIONS — no credentials were entered by this session; a prior session was already authenticated in this browser profile).
02-menu.png — .../menu?mode=menu&view=menu (Menu tab) — full menu list grouped by category (Favourites, Handcrafted Coffee, ...), search bar, category jump control. Reached signed in.
03-item.png — .../menu?mode=menu&view=menu, Cappuccino item sheet — size (S/M/L), milk choice, add-ons & extras, special-request chips, quantity stepper, "Add to order" £4.00. Reached signed in.
04-basket.png — .../menu?mode=menu&view=cart — basket with the added Cappuccino, redeem-with-points toggle, collection time, tip selector, order total, and the Pay/GPay/Place Order bar. This is the last screen before payment — none of Pay, GPay or Place Order was pressed. Reached signed in.
06-rewards.png — .../menu?mode=menu&view=rewards — Loyalty Club: VIP tier, spendable points, drink stamp card (9/10), redeem-with-points offers, points-history link. Reached signed in.
07-account.png — DELETED by the foreman. It showed the account owner's real full name and email address. Not recoverable from here; do not re-capture it.

Note: all screens required an authenticated session; the koraos.co.uk/cafe-roma app has no guest/browse-without-login path from this URL. No sign-in was performed by the capture session — the browser profile was already logged in as the app owner.

## PRIVACY — read before using any of these images

Every capture above is a live, signed-in session belonging to the café owner. Before any of these
appear on the public site:

- **The top header on all five reads "Evening, Steven" with an avatar.** Crop it off or cover it.
  Never ship a screen that reads as a named stranger's private account.
- **01-home.png contains a live loyalty QR code and the member code `ROMA-672375`.** The QR is a real
  scannable pass tied to a real account and must NOT be published. Replace it with a CSS/SVG-drawn
  QR-like block, or crop it out.
- **Real balances appear throughout** (2797 pts, 3747 lifetime, 97 visits, 13 free coffees). Prefer
  covering these with plausible neutral numbers, or crop them.
- These are safe to use for *layout, colour and structure* reference in all cases.

## RESOLUTION CAVEAT

These are 393x852 captures upscaled to 1179x2556 with ffmpeg/Lanczos, NOT native 3x captures.
Playwright's screenshot ignored every deviceScaleFactor/CDP override attempted. Pixel dimensions
match `images/app-home.png`, but the real detail is 1x, so they are softer than the three original
captures. Do not place them full-bleed at large sizes next to `images/app-home.png` — at the
~300px CSS phone width used in the rail they hold up fine.
