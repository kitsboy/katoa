# katoa — Last Updated 2026-09-21 by Buffy

**Brief:** Family Payment Core Batches 1–2 are shipped, and the future shared Give A Bit NIP-05 identity direction is documented.

**Batches:** `2cfd461` · `59b4efc` · docs `4ebb4ec`

**Verification:** `npm run check` green — 262 tests; typecheck clean; secret scan green; 14 existing lint warnings only.

**Payment status:** Family contract exists; BTCPay gift plug is wrapped; strict matching, staged event-ledger schema, atomic totals, replay-safe webhook shape, shared state UI, subscription intent metadata, audit foundation, health model, and MVP readiness checklist are now built locally. Subscriptions, zaps, Lightning Address, LNbits, direct LND, Silent Payments, reconciliation deployment, and production activation remain future work.

**Identity direction:** Buzz’s signed-event, separate-agent-key, scoped-permission, and human-approval ideas are useful at a much smaller scale. Future namespace: full handles such as `name@giveabit.io`; NIP-05, MotoPass, and Satohash remain separate layers.

**Current base:** Implementation `54361b0`; final build/docs stamp follows. Pre-existing `public/donations-qr.png` deletion remains untouched.

- Deep link `katoa.org/comparison?earnings=5000` previously contradicted itself: hero/slider showed default $10,000 while the calculator used 5,000. Root cause: two components each owned an independent monthly-earnings copy and both read/wrote the same query param.
- Fix: lifted state up to ComparisonPage; FeeComparison is now controlled (`value`/`onChange`) on /comparison and keeps independent state only on home/pricing.
- Verified live (Playwright 3/3 + CI green): `?earnings=5000` → slider 5000, "Save up to 1,000/month", OnlyFans $1,000/$4,000; no-param → 10,000/2,000/24,000 unchanged.
- New regression spec: `e2e/comparison-deeplink.spec.ts`.

Previous: 2026-08-27 Breez Spark footer donate / in-page QR.
