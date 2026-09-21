# katoa — Last Updated 2026-09-21 by Buffy

**Brief:** Shipped the three requested beauty-first discovery upgrades: cinematic creator splash cards, segmented Explore browsing, and a consistent premium Demo preview treatment.

**Visual batches pushed:**
- `c568adf` — full-screen creator splash cards with immersive portrait visuals, handle, one-line story, and one CTA.
- `80cd64c` — Explore segmented into `Projects`, `Creators`, and `Video`; selected tab is shareable in the URL.
- `04cceba` — shared `Demo preview` badge across creator cards, project cards, and the demo banner.

**Verification:** `npm run check` passed — 270 tests; typecheck clean; lint has the same 14 existing warnings; build passed with 26/26 prerendered routes; secret-hygiene gate passed.

**Product boundary:** These are presentation and discovery improvements only. Family Payment Core remains provider-agnostic; no THOR, live node, production secret, or real-money behavior was added.

**Git state:** `04cceba` is current on `origin/main`. Existing `public/donations-qr.png` deletion remains untouched.
