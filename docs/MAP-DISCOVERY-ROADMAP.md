# KATOA — Map & Discovery Enhancement Roadmap

Drafted 2026-08-16 · based on v1.1.7 (`9d38deb`) + btcmap-api v4 capabilities.
Focus area chosen by Cam: **Map + discovery**.

## Current baseline (already shipped)

- `UnifiedBTCMap`: Leaflet + CARTO dark raster basemap
- Two layers: KATOA creator pins (orange "K" teardrops) + BTC Map merchants (emoji glyph pins)
- Layer toggles, locate-me, fit-all, expand; layer persistence in localStorage
- Search (`GET /v4/search`) for areas + places with map-center bias; fly/fit on select
- Merchant popups hydrate via `GET /v4/places/{id}` (phone, hours, verified, comments, website)
- Map chrome i18n in 7 languages; KATOA pins inherit Explore vertical/category filters

## Gaps / pain points

1. **No clustering** — at low zoom `zoomToRadiusKm` returns 500 km, which can fetch/plot hundreds of unclustered pins.
2. **Clear-and-refetch on every pan** — `moveend` clears all merchant markers and refetches; no incremental merge, so markers flicker and the API gets hit hard.
3. **Popup body is hardcoded English** — "Hours:", "Verified", "Website →", "View on BTC Map →", "sats raised" are not i18n'd (chrome is).
4. **No URL state / deep-link** — map center/zoom/selected place are not shareable (`?lat=&lon=&zoom=&place=`).
5. **Unused btcmap-api v4** — areas (+ saved areas), events, activity feed, place issues, comments/boosts are available but not wired.
6. **KATOA pins are flat "K" dots** — no cover image, category, vertical color, or verified/boosted badge.
7. **Search dropdown** lacks keyboard navigation; no "search as I move".
8. **Dark-only basemap** — no theme parity.
9. **No offline place cache** — places refetch every session (only in-memory TTL today).

## Phased plan

### P0 — Correctness & scale (solo, no keys)

- **Marker clustering** — grid or `Leaflet.markercluster` with count badges; zoom-in expands clusters.
- **Incremental load** — merge cached places on move instead of clear-all; keep existing AbortController; add a per-area result cap + "load more here".
- **i18n popup strings** — thread a strings object into `buildMerchantPopupHtml` from `LanguageContext`.
- **URL state sync** — read `?lat/lon/zoom/place=` on mount; write on moveend via `history.replaceState` (debounced, no history spam).

### P1 — Discovery depth (solo)

- **Merchant category filter chips** — derive from `icon` (☕ 🍽 🏨 …), filter markers client-side.
- **Areas layer** — `GET /v4/areas`, render boundaries/names, click to fit bounds.
- **Events layer** — `GET /v4/events`, distinct pin style, date/link popup.
- **Place detail drawer** — side panel replacing/augmenting popup: full fields, description, OSM link, directions deep-link, report-issue link.
- **Keyboard nav on search** — arrow keys + Enter.
- **KATOA pin richness** — cover image thumbnail, vertical color ring, verified badge, sats progress in popup.

### P2 — Engagement & reach (solo)

- **Activity strip** — `GET /v4/activity` for "recently added near here" under the map.
- **Contribute flow** — "Add merchant / suggest edit" deep-links to btcmap.org (prefilled lat/lon).
- **Read-only place comments** — show count + top comment (submission needs NIP-98 auth → blocked).
- **Share map view** — copy URL with current lat/lon/zoom/place.
- **Remember last view** — persist last center/zoom + a "my city" default.

### P3 — Parity & polish (solo)

- **Theme-aware basemap** — light CARTO when site is in light theme.
- **Offline cache** — IndexedDB/localStorage place cache + incremental sync (btcmap sync guide).
- **Perf** — memoize marker creation, rAF debounce, virtualize popups.
- **Optional** — MapLibre + OpenFreeMap vector dark parity (tracked in `NEXT-NEEDS-CAM.md` #18).

### Needs Cam / THOR (blocked)

- **NIP-98 auth** (btcmap-api sign-in) for submitting comments/boosts → needs platform nsec vault.
- **Real creator geo-seed** — 10–20 creators with lat/lon so the KATOA layer is meaningful.
- **Dynamic OG** for shared map/place links.

## Batch 1 — shipped 2026-08-16

- [x] Popup i18n (7 langs) — merchant + KATOA popups
- [x] Marker clustering — 64px grid cells, count badges, zoom-in on click
- [x] URL state sync (`?lat=&lon=&zoom=&place=`) + place deep-link
- [x] Merchant category filter chips (6 categories + All)
- [x] KATOA pin cover thumbnails (circular photo pin w/ orange ring; falls back to "K" teardrop)
- [x] Search dropdown keyboard nav (arrow keys, Enter, Escape; combobox/listbox a11y)

## Remaining from first batch

1. KATOA pin vertical color ring (cover thumbnail shipped; per-vertical color pending).
2. Incremental load on pan (merge cached places instead of clear-all) — clustering helps but refetch-on-move remains.

## Definition of done

- `npm run check` (typecheck + eslint + vitest) green; tests added for new `src/lib/btcmap.ts` helpers.
- Handoff appended to `docs/KIMI-HANDOFF.md`, `LATEST-UPDATE.md` updated, pushed to `main`.
