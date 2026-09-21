# Next list — needs Cam / THOR (honest backlog)

Updated **2026-09-21** — Family Payment Core Batches 1–2 and checkout/preview/trust UX are shipped. Katoa is **not MVP yet**; product/docs tip is `4ebb4ec`.

## Still needs you (cannot finish alone)

### Newly finished alone on M3 — 2026-09-21
- Creator launch checklist: **add wallet → create wishlist → publish profile → share**.
- Payment status stepper: **invoice created → payment sent → creator received**, with the final state locked behind backend confirmation.
- Trust-first creator profile: wallet destination, proof badge, verification explanation, release attestations, and support CTA in one card.
- Checks: typecheck, lint, 249 tests, and production build green. No real money or settlement claims added.
- Follow-up UX batches pushed: first-wishlist wizard (`1d334aa`), wallet readiness state (`a7c4228`), payment expiry/retry/copy polish (`85e8e20`).
- Latest solo UX batches pushed: launch progress (`67be386`), wallet readiness preview (`ba0365a`), payment activity timeline (`0fe6a2e`).
- Checkout, preview, and trust UX pushed: mobile checkout sheet (`38eb19f`), preview readiness gaps (`d730ea6`), supporter trust summary (`1bdbfb4`).
- Family Payment Core Batch 1 pushed: contract/state machine/event-ledger primitives/fake fixtures (`2cfd461`).
- Family Payment Core Batch 2 pushed: existing gift client wrapped as BTCPay plug; existing webhook remains sole settlement writer (`59b4efc`).
- Handoff/docs stamp pushed (`4ebb4ec`). Verification: **262 tests**, typecheck, and secret-hygiene gate passed; 14 existing lint warnings remain.


### Family identity / NIP-05 — future shared Give A Bit layer
- Buzz review: use its signed-event, separate-agent-key, scoped-permission, and human-approval ideas; do not copy the full relay/workspace product.
- Desired namespace: canonical handles such as `name@giveabit.io`, recognized across Katoa and the family suite.
- NIP-05 domain mapping is discoverability, not legal identity. MotoPass passport and Satohash proof must remain separate optional layers.
- Current Katoa `/nip05` flow is still a local claim request copied for ops; platform nsec stays THOR-vault-only.
- Future order: shared registry schema → family verification → delegated agent keys/scopes → MotoPass/Satohash references.

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
10. **Confirm CF Pages** deployed `main` through `4ebb4ec` (hard-refresh: payment-core docs plus checkout sheet, preview readiness, supporter trust summary)

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
