# Staged Edge Functions

Deploy these when Supabase project is live:

| Function | Purpose |
|----------|---------|
| `btcpay-webhook` | HMAC verify + `transactions.status='confirmed'` + sats_raised (live) |
| `parse-url` | Server-side product metadata extraction |
| `prices` | Cached multi-currency → sats conversion |
| `health` | API dependency status for client |

`btcpay-webhook` is implemented — see `btcpay-webhook/README.md` for deploy (`--no-verify-jwt`, secrets via `supabase secrets set`). Never put webhook secrets or the service role key in git / `VITE_*`.

See `docs/ROADMAP.md` for other implementation templates.