# katoa — Last Updated 2026-09-12 by Ziggy (t_d9f4141e)

**Brief:** /comparison deep links now consistent — hero, slider and fee calculator share one source of truth for `?earnings=`.

**Commit:** `6b23d54` (fix) + `3e88dcb` (regression spec).

- Deep link `katoa.org/comparison?earnings=5000` previously contradicted itself: hero/slider showed default $10,000 while the calculator used 5,000. Root cause: two components each owned an independent monthly-earnings copy and both read/wrote the same query param.
- Fix: lifted state up to ComparisonPage; FeeComparison is now controlled (`value`/`onChange`) on /comparison and keeps independent state only on home/pricing.
- Verified live (Playwright 3/3 + CI green): `?earnings=5000` → slider 5000, "Save up to 1,000/month", OnlyFans $1,000/$4,000; no-param → 10,000/2,000/24,000 unchanged.
- New regression spec: `e2e/comparison-deeplink.spec.ts`.

Previous: 2026-08-27 Breez Spark footer donate / in-page QR.
