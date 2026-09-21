# katoa — Last Updated 2026-09-21 by Buffy

**Brief:** Preserved the Skate Colombia video change and made the featured media frame explicitly fixed so it cannot escape the card.

**Correction:**
- Git still contains the skateboard clip from `ae74e11`; no work was lost.
- Replaced competing aspect-ratio/height rules with explicit fixed responsive heights and `!aspect-auto`.
- Kept persistent video playback and functional mute/unmute behavior.

**Deployment status:** Cloudflare had `0834226` stuck in an active build while `ae74e11` was queued, so production remained on `1c27cce`. Cancel the stuck build and let the newest deployment publish before purging cache.

**Verification:** `npm run check` passed — 270 tests; typecheck clean; build passed with 26/26 prerendered routes; secret-hygiene gate passed.

**Git state:** Latest source correction is pushed. Existing `public/donations-qr.png` deletion remains untouched.
