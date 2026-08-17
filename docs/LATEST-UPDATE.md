# KATOA — Last Updated 2026-08-16 by Grok

Brief: Map fully offline after first view — SW caches OpenFreeMap vector tiles (style, .pbf, glyphs, sprites); fixed flaky double-canvas map init race.
Commit: `4eec62a`

## What landed (batch 5 — offline vector tiles)

1. **SW tile cache** — `public/sw.js` now intercepts `tiles.openfreemap.org` requests (style JSON, vector tiles, glyphs, sprites) into persistent Cache Storage `katoa-map-tiles-v1` (cap 1,000, LRU eviction, stale-while-revalidate online). After one view, the whole map — basemap + labels — renders from cache offline. Works for both `UnifiedBTCMap` and `KatoaPinsMap` with zero MapLibre changes.
2. **Map init race fix** — `mapRef.current` was assigned after `await loadMerchants/...`; a mid-init deps change (center updates when wishlists load) leaked the first map's canvas and a second init appended another canvas to the same container (~1/5 loads, seen as a strict-mode violation in e2e). Now registered immediately after map creation, with cancelled-bail after each await. Stress-tested 8/8 single-canvas; map e2e 3/3 ×3.
3. **E2E coverage** — offline flow added: view map → SW caches tiles → go offline → reload → canvas still renders from cache.

## Verified
- `npm run check` 108 tests ✓ · `npm run build` ✓ · Playwright 5/5 ✓ (map 3/3, offline test included)

Prior: MapLibre GL v6 + OpenFreeMap vector parity (#18) at `dc650ee`. Map roadmap complete through batch 5; remaining map work is Cam/THOR blocked (NIP-98 auth, real creator geo-seed, dynamic OG).
