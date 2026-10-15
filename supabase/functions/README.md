# Staged Edge Functions

Deploy these when Supabase project is live:

| Function | Purpose |
|----------|---------|
| `btcpay-webhook` | HMAC verify + `transactions.status='confirmed'` + sats_raised (live) |
| `onchain-watcher` | Scheduled; settles on-chain gifts by exact amount + confirmations (needs `WATCHER_SECRET` + a cron) |
| `parse-url` | Server-side product metadata extraction |
| `prices` | Cached multi-currency → sats conversion |
| `health` | API dependency status for client |

`btcpay-webhook` is implemented — see `btcpay-webhook/README.md` for deploy (`--no-verify-jwt`, secrets via `supabase secrets set`). Never put webhook secrets or the service role key in git / `VITE_*`.

`onchain-watcher` is implemented too — see `onchain-watcher/README.md`. Unlike the webhook it is **scheduled**, not event-driven, and needs `WATCHER_SECRET` set before it will run at all.

See `docs/ROADMAP.md` for other implementation templates.