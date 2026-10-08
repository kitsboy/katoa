# Katoa — Last Updated 2026-10-08 by Buffy

Brief: Reconciled doc truth to the current repo tip, fixed a stale BTCPay client comment and a stale subscription spec reference, and added focused test coverage for the existing BTCPay proxy path.

**Done:**
- Reconciled docs to the current repo state after the Sentry follow-up landed on `main`.
- Corrected `src/lib/btcpay.ts` comment so it matches the current proxy-based client path; the browser still never sends a BTCPay store API key.
- Corrected `docs/SUBSCRIPTION-FLOW-SPEC.md` so it no longer cites a missing `requestLnurlInvoice` helper in `src/lib/nostr.ts` and stays honest about webhook activation.
- Added fake BTCPay proxy-facing request/response shapes to the existing test fixtures.
- Added a focused test for the current BTCPay client proxy path (`createInvoice` + `getInvoice` over the server proxy shape).

**Verification:** 316 tests passed across 48 files; typecheck, lint, security gate, build, 26/26 prerendered routes, and source/dist asset-reference guards passed. Existing Vite chunk-size, dynamic-import, and Browserslist warnings remain non-blocking.

**Git state:** Latest pushed commit on `main` is `90ae447`. Remote `origin/main` matches local `main`. No Supabase functions, migrations, secrets, or deployment were changed.
