# Nostr audit — KATOA (2026-08-11)

## Live site

| Check | Result |
|-------|--------|
| `GET /.well-known/nostr.json` | Was **404** (SPA/404 shell). Fixed via `public/.well-known/nostr.json`. |
| CSP `connect-src` relays | damus, nostr.band, nos.lol, snort, wine — **plus** primal, purplepag.es, nostr.bg after upgrade |

## Code map

| Path | Role |
|------|------|
| `src/lib/nostr.ts` | Core client: pool, profile, wishlist NIP-78, NIP-04 DM, NIP-57 zap request, NIP-65, LNURL-pay |
| `src/contexts/AuthContext.tsx` | `signInWithNostr` (extension probe only — no weak session), `syncNostrProfile` |
| `src/pages/SettingsPage.tsx` | Manual npub field + NIP-07 link + publish lud16/NIP-65 |
| `src/pages/WishlistPage.tsx` | Payment tab “Nostr Zap” → LNURL + optional 9734 |
| `src/components/PaymentMethodTabs.tsx` | lightning / onchain / nostr tabs |
| `src/components/PaymentMethodManager.tsx` | Store `nostr` payment method type |
| `src/components/ShareButton.tsx` | Copy note + njump (not real NIP-07 publish) |
| `public/.well-known/nostr.json` | NIP-05 names + relays |
| `public/_headers` | CSP relays + NIP-05 Content-Type/CORS |

## What was implemented before this pass

| Feature | Status | Notes |
|---------|--------|-------|
| NIP-07 getPublicKey / signEvent | Partial | Used in service; login disabled for security |
| Kind 0 profile read/write | Yes | `getProfile` / `publishProfile` |
| Kind 1 notes | No UI before; helper added | `publishNote` |
| Kind 4 NIP-04 DM | API only | No chat UI in app |
| NIP-17 gift wrap | Not present | Intentionally not forced this pass |
| Kind 9734 zap request | Partial | Amount was sats not msats — **fixed** |
| Kind 9735 receipts | Missing | **validate + fetch added** |
| Kind 10002 NIP-65 | Missing | **get + publish added** |
| NIP-05 | Missing live | **static file + headers** |
| Relay management | Hardcoded 5 | **expanded + NIP-65 resolve** |

## Broken / incomplete (with refs)

1. **NIP-05 404** — no static file (live confirmed).
2. **AuthContext `signInWithNostr`** (~L230–247) — cannot create session without Edge challenge (correct; messaging improved).
3. **`createZapRequest` amount** — was sats; NIP-57 needs **millisats** (fixed in new `amountSats` API).
4. **`pool.publish` fire-and-forget** — no multi-relay OK aggregation (improved with `publishToRelays`).
5. **No chat UI** — only library `sendEncryptedMessage` (NIP-04).
6. **ShareButton “Nostr”** — clipboard + njump, not signed events.
7. **Wishlist Nostr tab** — tab existed but no zap path (wired to LNURL + optional 9734).

## Security notes

- Never store nsec in repo. Platform nsec only in gitignored `.nostr-platform-secret.local.json` → move to THOR vault.
- NIP-07 only for browser signing.
- No public-key-as-password login.
