# BTCPay webhook — confirm gifts server-side

**Status:** implemented. Deploy on the linked Supabase project with store secrets (Cam/THOR).

The browser records gift **intent** (`transactions.status = 'pending'`). This function is the only path that marks a payment `confirmed` and bumps `sats_raised`.

This endpoint is Katoa's first Family Payment Core provider plug. The client adapter in `src/lib/btcpay.ts` creates/reads intents; this signed server endpoint remains the only settlement writer and event source. Do not create a second frontend payment contract.

## What it does

1. `POST` only (BTCPay server-to-server — no CORS).
2. If `BTCPAY_WEBHOOK_SECRET` is missing → **501** `not configured`.
3. Verify `BTCPay-Sig` as HMAC-SHA256 of the **raw body**, header format `sha256=<hex>`.
4. On `InvoiceSettled` / `InvoicePaymentSettled` (or `invoiceStatus === Settled`), branch on `metadata.kind`:

**Gift / tip / PPV (`kind` absent or `gift`):**
   - Resolve the row via `metadata.katoa_tx_id` / `metadata.transactionId` / `orderId`, or `payment_hash` matching `invoiceId`.
   - Append a `payment_events` row keyed by the provider event id (idempotency).
   - `UPDATE transactions SET status = 'confirmed'`, plus the on-chain `txid` when the payload carries a real 64-hex one, and the settled amount.
   - **Recompute** funding totals with `recompute_funding_totals(p_wishlist_id, p_item_id)` — never add the amount.
   - Idempotent: an already `confirmed` row returns `{ updated: false, idempotent: true }`.

**Subscription (`metadata.kind === 'subscription'`):**
   - Requires `metadata.subscriber_id` (uuid) and `metadata.creator_id` (uuid); a slug is rejected.
   - The tier price comes from the canonical table in `_shared/settlement.ts` (`supporter` 21k / `patron` 42k / `champion` 105k sats, 30-day term) — the payload can never discount it. An overpayment is accepted; an underpayment is rejected with 422.
   - Upserts the `subscriptions` row (`status = 'active'`, `active_until = now + term`, `invoice_id`), which is the paid feed gate read by `useCreatorSubscriptions`.

### Why recompute and not increment

`transactions` used to have two writers with different maths: the `trg_update_funding` trigger recomputed `total_sats_raised` from confirmed rows while this function also called the additive `increment_funding_totals(...)`. One settled gift therefore moved the counter **twice**. Migration `20261015130000_settlement_totals_and_txid.sql` gives the column one semantics: `recompute_funding_totals` is the implementation, the legacy additive RPC now recomputes and ignores its amount argument (so an older deploy cannot double-count), and the trigger delegates to the same function. A test asserts this function never calls the additive RPC again.

### On-chain txid

`transactions.txid` (unique when present) holds the settled on-chain transaction id, so the creator dashboard can link **one payment** instead of an address history. A collision returns 409 rather than silently overwriting another row's payment.

## Deploy

JWT auth must be **off** — BTCPay does not send a Supabase JWT.

```bash
supabase functions deploy btcpay-webhook --no-verify-jwt
supabase secrets set BTCPAY_WEBHOOK_SECRET
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by the Edge runtime. Do **not** put them (or the webhook secret) in git, `.env`, or any `VITE_*` client var.

In BTCPay: Store → Settings → Webhooks → destination

```
https://<project-ref>.supabase.co/functions/v1/btcpay-webhook
```

Events: `InvoiceSettled`, `InvoicePaymentSettled`. Paste the webhook secret BTCPay shows into `supabase secrets set` (never commit it).

## Env (server only)

| Name | Where |
|------|--------|
| `BTCPAY_WEBHOOK_SECRET` | `supabase secrets set` |
| `SUPABASE_URL` | auto |
| `SUPABASE_SERVICE_ROLE_KEY` | auto |
