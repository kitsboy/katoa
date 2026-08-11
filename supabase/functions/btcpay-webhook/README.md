# Edge Function stub — BTCPay / LNbits webhook

**Status:** scaffold only. Needs store secrets + Cam deploy.

## Goal

When an invoice is paid:

1. Verify webhook signature / HMAC
2. Mark `transactions.status = 'confirmed'`
3. Update `wishlist_items.sats_raised` / wishlist totals
4. Never trust the browser for confirmation

## Env (when live)

- `BTCPAY_WEBHOOK_SECRET` or LNbits equivalent
- Supabase service role key (server only)
