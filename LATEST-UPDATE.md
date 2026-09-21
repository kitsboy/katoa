# katoa — Last Updated 2026-09-21 by Buffy

**Brief:** Three checkout-focused UX batches shipped: mobile checkout sheet, preview readiness gaps, and supporter trust summary.

**Batches:** `38eb19f` · `d730ea6` · `1bdbfb4`

**Verification:** `npm run check` green — 251 tests; `npm run build` green with 26/26 routes; secret scan green; 14 existing lint warnings only.

**What remains:** Real invoice → webhook → confirmed settlement, live Nostr identity, and live creator data. Katoa is not MVP yet.

**Current base:** `1bdbfb4` on `origin/main`; pre-existing `public/donations-qr.png` deletion remains untouched.

- Deep link `katoa.org/comparison?earnings=5000` previously contradicted itself: hero/slider showed default $10,000 while the calculator used 5,000. Root cause: two components each owned an independent monthly-earnings copy and both read/wrote the same query param.
- Fix: lifted state up to ComparisonPage; FeeComparison is now controlled (`value`/`onChange`) on /comparison and keeps independent state only on home/pricing.
- Verified live (Playwright 3/3 + CI green): `?earnings=5000` → slider 5000, "Save up to 1,000/month", OnlyFans $1,000/$4,000; no-param → 10,000/2,000/24,000 unchanged.
- New regression spec: `e2e/comparison-deeplink.spec.ts`.

Previous: 2026-08-27 Breez Spark footer donate / in-page QR.
