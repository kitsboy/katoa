# Next list — needs Cam / THOR (honest backlog)

Updated **2026-08-16** — added OF-parity subscription backend (HEAD `eccc285`, v1.1.7).

## Still needs you (cannot finish alone)

### Subscriptions (OF-parity) — ⭐ handoff for next LLM on Hermes
- **SPEC:** `docs/SUBSCRIPTION-FLOW-SPEC.md` — DB `subscriptions` table, invoice `metadata.kind='subscription'`, webhook activation.
- **Needs the LND server on THOR** (BTCPay Greenfield, LNbits API, or LND REST). Secrets → THOR vault only.
- Client seam is done (`src/lib/subscriptions.ts`); backend is the only missing piece.

### Money
1. **BTCPay or LNbits / LNURL** production + CF secrets  
2. **Webhook live** (`supabase/functions/btcpay-webhook/`) → confirm txs  
3. **Staging + testnet Lightning**  
4. **Real zap e2e** with your lud16 + Alby on funded network  
5. **Authoritative Supabase** product counters in production env  

### Secrets / ops
6. **Backup platform nsec** → THOR vault (`.nostr-platform-secret.local.json`) then delete local  
7. **Deploy Edge Function** for NIP-07 challenge login (stub README ready)  
8. **Ops process for NIP-05 claims** (`/nip05` UI copies request; merge into `public/.well-known/nostr.json` or automate)  
9. **Sign platform kind-0 + NIP-65** once with vault nsec  
10. **Confirm CF Pages** deployed `main` through `9d38deb` (hard-refresh Explore map)

### Human growth
11. **Seed 10–20 real creators**  
12. **Permissioned case studies**  
13. **Bug bounty sats budget** (page exists; amounts TBD)  
14. **Meetup / marketing execution**  

### Optional infra
15. Dynamic OG **edge worker** (static `og-share.svg` is a start)  
16. Image CDN transforms  
17. Server-side invoice rate limits  
18. ~~MapLibre + OpenFreeMap vector parity~~ ✅ shipped batch 4 (2026-08-16) — Leaflet fully removed  

---

## Done alone this pass (code on main)

### Product 10-pack (v1.1.5+)
- Tip menu 21k/50k/custom · favorites export · visibility badge  
- DM blocklist + unread badge · explore vertical chips · PWA creator copy  
- a11y messages/creators · Playwright `/messages` · i18n  

### Map / btcmap-api (v1.1.6–1.1.7)
- Clean basemap (no logo carpet) · K pins · merchant emoji icons  
- `GET /v4/places/search` · hydrate `GET /v4/places/{id}` · `GET /v4/search`  
- Layer toggles, locate, fit, expand preserved  

### Agent docs
- `.ai_docs/ecosystem-links.md` · `project-summary.md` · `.ai_agent/README.md`  
- Handoffs: `docs/KIMI-HANDOFF.md` · `docs/LATEST-UPDATE.md`  

### Prior (same era)
- `/messages` NIP-17 opt-in · `/nip05` · `/creators` · verticals · Nostr client path  

See also: `docs/NOSTR-REMINDERS.md`, `docs/NOSTR-AUDIT.md`, `.ai_docs/current-status.md`.
