# BTCPay webhook — deploy checklist (Katoa)

**Owner:** Cam / THOR · **Status:** staged, not live · **Do not apply secrets to prod until the end-to-end row below is green.**

This checklist is stitched from the repo, not from memory:

- `supabase/functions/btcpay-webhook/index.ts`
- `supabase/functions/_shared/settlement.ts`
- `supabase/migrations/20261015130000_settlement_totals_and_txid.sql`
- `src/lib/btcpay.ts`
- `src/lib/__tests__/settlementWebhook.test.ts`
- `supabase/functions/btcpay-webhook/README.md`
- `public/_headers` + `src/lib/__tests__/cspOrigins.test.ts`

## 1. Decide on the money path first

The repo has two separate on-ramps and they are not interchangeable:

- **Lightning via BTCPay.** Browser creates a BTCPay invoice through a **server proxy** (`VITE_API_BASE_URL`), then the **signed webhook** marks the gift confirmed when BTCPay sends `InvoiceSettled` / `InvoicePaymentSettled`.
- **On-chain via the watcher.** An on-chain payment reaches nobody’s server, so `supabase/functions/onchain-watcher` polls published addresses and settles matching pending gifts on its own schedule.

Do not deploy the webhook and assume on-chain gifts are covered. That is item 3 in `docs/LATEST-UPDATE.md` (“Deploy the on-chain watcher as a real recurring job”).

## 2. Confirm what “live” actually means for the webhook

Today the webhook’s gift path is **not** “write a new settlement table.” The actual path is:

1. BTCPay sends the raw body + `BTCPay-Sig: sha256=...`
2. The function verifies the HMAC of the raw body against `BTCPAY_WEBHOOK_SECRET`
3. It parses the event (`supabase/functions/_shared/settlement.ts`)
4. It resolves the row in `transactions` via `katoa_tx_id` / `transactionId` / `transaction_id` / `orderId` / `order_id` / `invoiceId`, falling back to `payment_hash` matching the invoice id
5. It appends a `payment_events` row (idempotency key = provider event id)
6. It `UPDATE transactions SET status = 'confirmed', confirmed_at, external_id` — and writes a validated 64-hex `txid` only if the payload carried one
7. It recomputes totals with `recompute_funding_totals(p_wishlist_id, p_item_id)` — never `increment_funding_totals`

The migration `20261015130000_settlement_totals_and_txid.sql` is why step 7 is safe: `recompute_funding_totals` is the one totalling implementation, the legacy additive `increment_funding_totals` now recomputes and ignores its amount arg, and the funding trigger delegates to the same recompute. The test suite asserts the webhook does **not** call the additive RPC and that the migration does not leave two maths in place.

So item 9 in `docs/LATEST-UPDATE.md` is doc shorthand. The repo has **no** `payment_settlements` table. Do not read that line as “stand up a new table”; the staged webhook already settles through `transactions` + `payment_events` + `recompute_funding_totals`.

## 3. Pre-deploy checklist

### 3a. Secrets (Supabase Edge env only)

Set these server-side. Never in git, `.env`, `.env.local`, or any `VITE_*` client var.

- `BTCPAY_WEBHOOK_SECRET` — the webhook secret BTCPay shows when you create the webhook
- `SUPABASE_URL` — auto-injected by the Edge runtime
- `SUPABASE_SERVICE_ROLE_KEY` — auto-injected by the Edge runtime

The existing `.env.local` is not enough here: it only holds browser-safe `VITE_*` values for a local dev project (`pglqjtipbocjnqmiwmwf`). It does not hold server secrets, and the webhook is server-only.

### 3b. BTCPay side

In BTCPay, for the store you intend to use:

- **Webhook URL:** `https://<project-ref>.supabase.co/functions/v1/btcpay-webhook`
- **Events:** `InvoiceSettled`, `InvoicePaymentSettled`
- **Secret:** paste into Supabase via `supabase secrets set BTCPAY_WEBHOOK_SECRET=...`

The client creates invoices with `metadata.katoa_tx_id` set to the intent id, so the webhook’s first lookup is by that reference. That metadata round-trip is part of the end-to-end below.

### 3c. Deploy flags

JWT auth must be **off** — BTCPay does not send a Supabase JWT.

```bash
supabase functions deploy btcpay-webhook --no-verify-jwt
supabase secrets set BTCPAY_WEBHOOK_SECRET=<value>
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by the Edge runtime. Do not hardcode them.

### 3d. Database state

Before the webhook can settle anything, the database must already have the shape it expects:

- `transactions` rows with `status = 'pending'` for intents the browser created
- `recompute_funding_totals(uuid, uuid)` present and callable by the service role
- `transactions.txid` column + unique index when present

If the migration has not been applied to the target project, the webhook will 500 on the funding totals step. Verify migration state on the target project before declaring the webhook deploy done.

### 3e. CSP note (do not “harden” this away)

The webhook itself is server-to-server; it is not affected by `public/_headers`. But the **browser** path that creates the invoice does matter.

The browser creates invoices through a server proxy at `VITE_API_BASE_URL`. That origin is **deploy-specific**, which is why the CSP keeps a bare `https:` hatch. The CSP guard (`src/lib/__tests__/cspOrigins.test.ts`) explicitly asserts that hatch must stay, and the comment in `public/_headers` says the same thing: narrowing `connect-src` back to a fixed list blocks payments.

So if anyone touches the CSP before or after deploy, the rule is: the BTCPay proxy origin is chosen outside this repo and cannot be enumerated here. If a deploy-specific proxy origin is later pinned, add that origin in the same change and let the guard fail if it is missing.

## 4. End-to-end row (before prod)

Do **not** declare the webhook deploy done on deployment success alone. The function returning 200 is not the same thing as money moving correctly.

Run one non-production invoice through it:

1. Create a test wishlist/item in the target project (or reuse a throwaway one)
2. Use the browser BTCPay plug path (`src/lib/btcpay.ts`) to create an invoice through the deployed proxy, with `katoa_tx_id` set
3. Confirm the `transactions` row is `pending` and has the right `katoa_tx_id` / `wishlist_id` / `item_id`
4. Trigger the webhook with a real BTCPay `InvoiceSettled` payload for that invoice (or simulate the webhook call with the real secret)
5. Confirm:
   - `transactions.status = 'confirmed'`
   - `transactions.txid` set if the payload carried a real 64-hex one
   - `payment_events` row appended
   - `wishlists.total_sats_raised` / item `sats_raised` recomputed, not double-counted
   - the response is idempotent if you replay the same event

If any of those is wrong, the deploy is not done; it just has a live secret now.

## 5. What the webhook will not do

Be explicit with whoever presses the button:

- It does **not** create invoices. The browser does that through the proxy.
- It does **not** settle on-chain gifts. That is the watcher.
- It does **not** price subscriptions from the payload. Tier price comes from `TIER_PRICES_SATS` in `_shared/settlement.ts`, and the test suite asserts it matches `src/lib/subscriptions.ts`.
- It does **not** accept an underpaid subscription invoice.
- It does **not** write a `payment_settlements` table, because the repo has none.

## 6. Suggested owners

- Deploy + secrets: Cam / THOR
- BTCPay store config: Cam / THOR
- End-to-end invoice run: whoever owns the money path; not done until one green row
- CSP changes: guarded by `src/lib/__tests__/cspOrigins.test.ts`, so any change that blocks the proxy origin must fail that test first
- On-chain coverage: separate task, see item 3 in `docs/LATEST-UPDATE.md`

## 7. If this is being read as a “is it ready?” answer

Code-ready: **yes, as staged.**  
Live-ready: **no, not until the end-to-end row is green on the target project.**

A deployment green light is necessary but not sufficient. The money path is only verified when one non-production invoice actually lands, settles, writes the event row, and recomputes the right totals once.
