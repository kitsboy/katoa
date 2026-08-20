# BTCPay webhook — confirm gifts server-side

**Status:** implemented. Deploy on the linked Supabase project with store secrets (Cam/THOR).

The browser records gift **intent** (`transactions.status = 'pending'`). This function is the only path that marks a payment `confirmed` and bumps `sats_raised`.

## What it does

1. `POST` only (BTCPay server-to-server — no CORS).
2. If `BTCPAY_WEBHOOK_SECRET` is missing → **501** `not configured`.
3. Verify `BTCPay-Sig` as HMAC-SHA256 of the **raw body**, header format `sha256=<hex>`.
4. On `InvoiceSettled` / `InvoicePaymentSettled` (or `invoiceStatus === Settled`):
   - Resolve the row via `metadata.katoa_tx_id` / `metadata.transactionId` / `orderId`, or `payment_hash` matching `invoiceId`.
   - `UPDATE transactions SET status = 'confirmed'`.
   - If `item_id` / `wishlist_id` are present (metadata or the row), increment `wishlist_items.sats_raised` and `wishlists.total_sats_raised` by the tx amount.
   - Idempotent: already `confirmed` / `completed` rows are not incremented again.

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
