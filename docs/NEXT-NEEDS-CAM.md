# Next list — needs Cam / THOR (honest backlog)

Updated after **NIP-17 opt-in chat** + solo packs (2026-08-11).

## Still needs you (cannot finish alone)

### Money
1. **BTCPay or LNbits / LNURL** production + CF secrets  
2. **Webhook live** (code stub in `supabase/functions/btcpay-webhook/`) → confirm txs  
3. **Staging + testnet Lightning**  
4. **Real zap e2e** with your lud16 + Alby on funded network  
5. **Authoritative Supabase** product counters in production env  

### Secrets / ops
6. **Backup platform nsec** → THOR vault (`.nostr-platform-secret.local.json`)  
7. **Deploy Edge Function** for NIP-07 challenge login (stub README ready)  
8. **Ops process for NIP-05 claims** (UI at `/nip05` copies request; you merge into `nostr.json` or automate)  
9. **Sign platform kind-0 + NIP-65** once with vault nsec  

### Human growth
10. **Seed 10–20 real creators**  
11. **Permissioned case studies**  
12. **Bug bounty sats budget** (page exists; amounts TBD)  
13. **Meetup / marketing execution**  

### Optional infra
14. Dynamic OG **edge worker** (static `og-share.svg` is a start)  
15. Image CDN transforms  
16. Server-side invoice rate limits  

---

## Done alone this pass (incl. NIP-17)

- **`/messages`** — opt-in private chat (NIP-17 gift-wrap when NIP-44; else NIP-04)  
- Message CTA on wishlists with creator npub  
- `/nip05` claim request UI  
- `/creators/guidelines`  
- Edge function stubs (auth + webhook)  
- Creator verticals, playbook, templates, product links, Nostr publish, zaps client path, etc.

See also: `docs/NOSTR-REMINDERS.md`, `docs/NOSTR-AUDIT.md`.
