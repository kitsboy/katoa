# katoa — Last Updated 2026-09-21 by Buffy

**Brief:** Repaired and upgraded the featured Skate Colombia video card on Explore.

**What changed:**
- Replaced the mismatched ocean/drone clip with a skateboard video matching the Medellín project.
- Fixed video overflow and card framing across mobile and desktop.
- Added persistent featured-video playback so the volume control operates on the real video.
- Audio remains muted by default for browser safety; the user can intentionally unmute.
- Kept the skateboard beauty shot as the poster and retained the direct Support CTA.

**Verification:** `npm run check` passed — 270 tests; typecheck clean; lint has the same 14 existing warnings; build passed with 26/26 prerendered routes; secret-hygiene gate passed.

**Git state:** Focused video/card batch follows the current `main` tip. Existing `public/donations-qr.png` deletion remains untouched.
