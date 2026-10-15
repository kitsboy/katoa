# On-chain watcher — settle on-chain gifts server-side

**Status:** implemented. Deploy **and schedule** on the linked Supabase project (Cam/THOR).

Lightning settles through `btcpay-webhook`. An on-chain payment reaches nobody's server on its own, so nothing would ever confirm a gift paid that way. This scheduled function is the on-chain equivalent of the webhook: it polls the receive addresses creators published and settles the gifts that match.

## What it does

1. `WATCHER_SECRET` missing → **501** `not configured` (it refuses to run unauthenticated).
2. The secret must arrive in the `x-watcher-secret` header or `?secret=` — a scheduler call, not a browser call (no CORS).
3. Reads up to **25** active `wallet_addresses` rows of `address_type = 'onchain'` per run, so one run cannot hammer the explorer.
4. For each address, fetches received outputs from `MEMPOOL_API_BASE` (default `https://mempool.space/api`) and counts confirmations against the current chain tip.
5. Matches them to that creator's pending rows with `matchOnchainPayments()` (`_shared/onchain.ts`), and settles:

| Rule | Why |
|------|-----|
| Exact sat amount, one output to one row | A rounded or "close enough" match invents money |
| Minimum 2 confirmations, never 0 | An unconfirmed transaction can still be replaced |
| Dust (< 1000 sats) is not settleable | Too small to be a real gift, too easy to fake by accident |
| A txid settles **one** row, and never a row that already has one | Two rows must never claim the same payment |
| Only rows with `status = 'pending'` and `txid IS NULL`, oldest first | A settled gift cannot be settled twice |

6. Claims `txid` before confirming (`UPDATE … WHERE txid IS NULL`), so a race cannot attribute one payment twice; the unique index on `transactions.txid` is the backstop.
7. Sets `status = 'confirmed'` + `confirmed_at`, then calls `recompute_funding_totals(p_wishlist_id, p_item_id)` — the same single totalling implementation the webhook uses. **Never** the additive legacy RPC.

Unmatched outputs are reported in the response (`rejected`) with the reason, so a stuck payment is visible instead of silent.

## Deploy

```bash
supabase functions deploy onchain-watcher --no-verify-jwt
supabase secrets set WATCHER_SECRET
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by the Edge runtime. Do **not** put them (or `WATCHER_SECRET`) in git, `.env`, or any `VITE_*` client var.

## Schedule

Every few minutes (Supabase cron, or any external pinger that can send the header):

```bash
supabase functions schedule onchain-watcher --cron "*/5 * * * *"
```

An external pinger needs the secret in the URL or header:

```bash
curl -sS -H "x-watcher-secret: $WATCHER_SECRET" \
  https://<project-ref>.supabase.co/functions/v1/onchain-watcher
```

## Response

```json
{ "ok": true, "wallets": 1,
  "results": [{ "address": "bc1q…", "outputs": 3, "settled": 1, "rejected": 2, "requiredConfirmations": 2 }] }
```

`settled` counts rows this run confirmed. A `rejected` count that keeps growing with no `settled` means either a wrong amount or too few confirmations — check `mempool.space` for the address before changing any rule.

## Env (server only)

| Name | Where |
|------|--------|
| `WATCHER_SECRET` | `supabase secrets set` |
| `SUPABASE_URL` | auto |
| `SUPABASE_SERVICE_ROLE_KEY` | auto |
| `MEMPOOL_API_BASE` | optional, default `https://mempool.space/api` |
