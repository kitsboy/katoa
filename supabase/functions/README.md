# Staged Edge Functions

Deploy these when Supabase project is live:

| Function | Purpose |
|----------|---------|
| `btcpay-webhook` | HMAC verify + update transaction status |
| `parse-url` | Server-side product metadata extraction |
| `prices` | Cached multi-currency → sats conversion |
| `health` | API dependency status for client |

See `docs/ROADMAP.md` for implementation templates.