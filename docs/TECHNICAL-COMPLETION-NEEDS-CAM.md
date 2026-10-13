# Technical completion needs Kimi / Cam — KATOA

Updated 2026-10-12.

This is the honest path for the **live payment + live counters** side of KATOA.
It is intentionally separate from the demo/sample work. Demo can stay beautiful
and sample-only until this path is real.

## Current truth

- `/demo` is now a stronger sample protagonist hub around Luna.
- The sample creator world around Luna is deeper in `src/data/mockWishlists.ts`.
- The app is still **not production** from a money/counters perspective.
- Sample numbers, sample wishlists, and sample creator profiles are deliberately
  labeled and not claimed to be live.

## What is missing for live money + live counters

### 1. Lightning rail
Pick one and only one to start:
- BTCPay store with Greenfield API, or
- LNbits with its HTTP API, or
- LND REST directly

Do not add multiple rails in parallel yet. One rail first.

### 2. Server-side secrets
- Store invoice and webhook secrets, store API keys, and LND macaroons in the
  vault only.
- Do not put them in git, `.env` committed files, or `VITE_*` client variables.
- Frontend stays secret-free.

### 3. Invoice path
- Create a real invoice for a real amount.
- Tag metadata so the backend knows what it is for, for example:
  - `kind`
  - creator id
  - wishlist id / tier id when relevant
- Validate the amount server-side before issuing an invoice.

### 4. Webhook
- Deploy the webhook path.
- Verify the signature/HMAC server-side.
- On a valid settlement event:
  - append the payment event first
  - reject mismatches
  - update only pending rows once
  - call the atomic funding-total update
- The webhook is the only writer for confirmed funding. The browser must never
  mark a payment as confirmed.

### 5. Atomic funding totals
- Use the atomic function for incrementing funding totals.
- Do not rely on read-then-write totals.
- This matters for correctness when multiple payments arrive.

### 6. Supabase product counters
- Make the production Supabase database authoritative for:
  - creators
  - wishlists
  - campaigns
  - sats raised
  - funded campaigns
  - funding rate
  - recent confirmed activity
- Replace sample-only metrics with real counters once this is live.
- Keep the sample catalog clearly labeled until live counts are real.

### 7. Staging and testnet first
- Do not go to mainnet until staging/testnet replay is healthy.
- Run funded test payments.
- Replay webhook events.
- Confirm totals update correctly.
- Confirm edge cases like duplicate events and mismatched metadata.

### 8. Live creator seeding
- Seed a small number of real creators with real receive info.
- Not 10,000 fake ones.
- A few real ones with real content and real receive destinations.

### 9. Ops questions only Kimi/Cam can answer
- Which Lightning rail is chosen?
- Is the webhook deployed?
- Is the secret in the vault only?
- Is Supabase product counters live?
- Is the latest main actually deployed and serving?
- Is the platform nsec in the vault?
- Is NIP-05 ops ready if you want identity handles?
- Who is seeding real creators?

## What the frontend already has that should not be rebuilt

- Family payment core contract and state machine
- Provider plug shapes and fake fixtures
- Payment UI using the same state vocabulary
- Demo/staged/live labels on payment surfaces
- Demo-only seams clearly labeled
- Honest payment status language that never claims browser-side settlement

Do not rebuild these. Wire the real backend behind them when ready.

## Acceptance criteria for live money + live counters

- A real invoice can be created server-side for a valid amount.
- A valid webhook can settle a payment and update totals atomically.
- The browser never marks a payment confirmed on its own.
- Product counters come from the live database, not sample data.
- Duplicate or mismatched events are rejected.
- Sample content and sample numbers are still clearly labeled until live data is real.

## Honest sequencing

1. Choose one rail.
2. Put secrets in the vault only.
3. Wire one real invoice path server-side.
4. Deploy the webhook with signature verification.
5. Use the atomic totals function.
6. Staging/testnet replay and funded test payments.
7. Make Supabase the authoritative counter source.
8. Seed a few real creators.
9. Then consider public launch steps.

## Sample-only rule

No matter what else happens:
- sample creators stay sample
- sample numbers stay labeled
- demo flows stay demo
- no browser code ever pretends a payment is live

If you want to take Luna public later, the public version should be real Luna
or clearly-labeled sample Luna, not an accidental mix of both.

— Buffy, M3
