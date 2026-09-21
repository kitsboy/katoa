# katoa — Last Updated 2026-09-21 by Buffy

**Brief:** Fixed the stale service-worker asset failure and shipped immersive creator profiles, mobile swipe discovery, and richer demo creator worlds.

**Pushed batches:**
- `3b03be8` — service-worker cache recovery plus full-bleed creator profile heroes and dominant Support CTA.
- `8f15e54` — mobile snap-scrolling creator shelf with swipe cue.
- `1c27cce` — richer demo creator stories and curated Paul/Skate Colombia post drops.

**Route diagnosis:** `/explore/` was hitting the error boundary because an old service worker served stale hashed imports; missing chunks returned the SPA HTML with the wrong MIME type. `/comparison` rendered, but had the same cache risk. `public/sw.js` now uses cache `v18`, never caches itself, and rejects cached HTML for assets.

**Verification:** `npm run check` passed — 270 tests; typecheck clean; lint has the same 14 existing warnings; build passed with 26/26 prerendered routes; secret-hygiene gate passed. Local preview verified `/explore/`, `/comparison`, and `/u/paul_music` without errors or broken images.

**Deployment note:** Cloudflare must deploy the pushed cache fix; users with the old worker may need one fresh reload after deployment.

**Product boundary:** Family Payment Core remains provider-agnostic. No THOR, live node, production secret, or real-money behavior was added.

**Git state:** Documentation/build stamp follows the three code commits. Existing `public/donations-qr.png` deletion remains untouched.
