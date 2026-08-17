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

- [x] **Merchant category filter chips** — derive from `icon` (☕ 🍽 🏨 …), filter markers client-side. (batch 1)
- [x] **Areas layer** — `GET /v4/areas` at map center, area chips with icons + links (API returns no geometry; boundaries not possible). (batch 2)
- [x] **Events layer** — `GET /v4/events`, distinct pin style, date/link popup. (batch 2)
- [x] **Place detail drawer** — side panel replacing/augmenting popup: full fields, description, OSM link, directions deep-link, report-issue link. (batch 2)
- [x] **Keyboard nav on search** — arrow keys + Enter. (batch 1)
- [x] **KATOA pin richness** — cover image thumbnail (b1) + vertical color ring (b2); verified badge / sats progress pending.

### P2 — Engagement & reach (solo)

- [x] **Activity strip** — `GET /v4/activity?places=<visible>` "recently changed near here" under the map. (batch 2)
- [x] **Contribute flow** — "Add a place" deep-link prefilled with map center (OSM note — the funnel btcmap.org uses). (batch 2)
- [x] **Read-only place comments** — count + top comments in the drawer (`GET /v4/places/{id}/comments`). (batch 2)
- [x] **Share map view** — copy URL with current lat/lon/zoom/place. (batch 2)
- [x] **Remember last view** — persist last center/zoom; restore when no URL params. (batch 2)

### P3 — Parity & polish (solo)

- [x] **Theme-aware basemap** — CARTO `light_all` for light theme (OS `prefers-color-scheme` + `.lp-page`/`[data-theme="light"]` ancestor); `tileLayer.setUrl` swaps live without recreating the map. (batch 3)
- [x] **Offline cache** — localStorage place cache (merged, capped 600, 24h TTL) + per-place detail cache (capped 200); map seeds from cache for instant render + works offline; `savePersistedPlaceDetail` write-through on detail fetch. (batch 3)
- [x] **Perf** — memoized merchant divIcons (per place), rAF-throttled `moveend`, render-fingerprint skip (no re-cluster when nothing changed). (batch 3)
- [x] **MapLibre + OpenFreeMap vector parity** — Leaflet + CARTO raster replaced by MapLibre GL v6 + OpenFreeMap vector styles (`styles/dark` for dark theme, `styles/liberty` for light). Same renderer btcmap.org uses. (batch 4)

## Batch 4 — shipped 2026-08-16 (MapLibre vector parity #18)

- [x] Leaflet → **MapLibre GL v6** migration — `UnifiedBTCMap` + `KatoaPinsMap`; `leaflet` + `@types/leaflet` deps removed
- [x] **OpenFreeMap vector basemap** — `styles/dark` (dark theme) ↔ `styles/liberty` (light theme) live-swap via `map.setStyle`; same style family as btcmap.org
- [x] All features preserved: grid clustering (`map.project`), merchant/KATOA/event DOM markers, popups (i18n), place drawer, incremental load + offline cache, search, share, remember-view, theme detection
- [x] CSP `worker-src 'self' blob:` + `connect-src tiles.openfreemap.org`; vite manualChunk `maplibre`; maplibregl-* CSS for controls/popups
- [x] Playwright smoke asserts `.maplibregl-canvas` (WebGL + vector style actually render)

## Batch 3 — shipped 2026-08-16 (P3)

- [x] Theme-aware basemap (light CARTO live-swap → now OpenFreeMap Liberty via MapLibre)
- [x] Offline place + detail cache (localStorage, TTL-capped)
- [x] Marker perf (icon memo, rAF debounce, render skip)

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

## Batch 2 — shipped 2026-08-16

- [x] **Incremental load on pan** — `mergePlaces` by id + `haversineKm` halo pruning (radius × 1.5); no clear-and-refetch flicker; 400-place render cap with "Load more here" (+200/click)
- [x] **KATOA pin vertical color ring** — `katoaPinColor(category)` tints photo-pin ring + fallback teardrop (vertical colors, orange default)
- [x] **Events layer** — `GET /v4/events`, purple 📅 pins (viewport-filtered), date/link popup, persisted layer toggle
- [x] **Areas-here chips** — `GET /v4/areas?lat=&lon=` for the map center; chips link to area pages
- [x] **Place detail drawer** — right-side panel on merchant click: full fields, description, comments, OSM/directions/report/website links
- [x] **Read-only comments** — `GET /v4/places/{id}/comments` shown in the drawer (top 2)
- [x] **Activity strip** — `GET /v4/activity?places=<visible ids>&days=7`; type glyphs + relative time; click flies to place
- [x] **Contribute flow** — toolbar ➕ opens OSM note prefilled with map center; drawer has report-issue + suggest-edit links
- [x] **Share map view** — toolbar button copies `?lat&lon&zoom&place` URL (+ toast)
- [x] **Remember last view** — last center/zoom persisted to localStorage, restored when no URL params
- [x] Playwright smoke `e2e/map.spec.ts` (map mounts, toggles, share, search focus)

## Remaining from batch 1/2

1. ~~KATOA pin vertical color ring~~ ✅ shipped batch 2
2. ~~Incremental load on pan~~ ✅ shipped batch 2
3. `GET /v4/areas` boundaries/geometry — API returns no geometry; chips + links shipped instead (P1 adaptation)
4. Place issues layer (`GET /v4/place-issues`) — not wired yet

## Definition of done

- `npm run check` (typecheck + eslint + vitest) green; tests added for new `src/lib/btcmap.ts` helpers.
- Handoff appended to `docs/KIMI-HANDOFF.md`, `LATEST-UPDATE.md` updated, pushed to `main`.

## Map roadmap status

Batch 1 (popup i18n, clustering, URL sync, category chips, pin thumbnails, search nav) ✅ · Batch 2 (incremental load, events, areas, drawer, activity, contribute, share, remember-view, pin colors) ✅ · Batch 3 (P3: theme basemap, offline cache, perf) ✅ · Batch 4 (MapLibre + OpenFreeMap vector parity) ✅ — **map roadmap complete.** Remaining map work is Cam/THOR blocked: NIP-98 auth, real creator geo-seed, dynamic OG.
