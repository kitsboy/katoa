# REMINDERS — Nostr / platform ops (do not skip)

**For Cam + next Grok session.** Updated 2026-09-21 after Family Payment Core review and Buzz identity-model review.

## Family identity note

The long-term goal is one verified Give A Bit namespace, using full NIP-05 handles such as `name@giveabit.io` across the family suite. NIP-05 is domain-to-pubkey discoverability, not legal identity. Keep MotoPass passports and Satohash timestamps as separate optional proof layers. Agent identities must use separate, scoped, revocable keys with human approval.

## Safe rollout order (already in PR `7ecff71`)

1. **NIP-05** static file + headers (discoverability) — verify live  
2. **Relay list + CSP** (connectivity) — verify no CSP blocks  
3. **NIP-65 + zap path** (payments identity) — Settings + wishlist Nostr Zap tab  
4. **Chat NIP-17 later** (not forced this pass)

## Not in that pass (by design)

- Server NIP-07 session login (needs Edge Function)
- Dynamic `creator@katoa.org` automation
- Self-hosted relay
- Full NIP-17 gift-wrap chat UI
- Committing platform **nsec** (must stay offline / vault)

## ACTION — Cam / THOR

- [ ] **Back up** `.nostr-platform-secret.local.json` into **THOR vault** (only place for platform nsec)
- [ ] Then delete local copy if desired
- [ ] Without that nsec you **cannot sign** as `katoa@katoa.org` for platform notes

Also see **`docs/NEXT-NEEDS-CAM.md`** for the full “needs human” backlog after solo YOLO batches.

**Pubkey (public):** `npub1349w8xkkjphzwtnhsaez2w6ehxhgwy58zppcql6x2ktqlmqwgssqqpyukn`  
**NIP-05:** `katoa@katoa.org` / `_@katoa.org`  
**File live:** `https://katoa.org/.well-known/nostr.json`

## Related docs

- `docs/NOSTR-AUDIT.md`
- `docs/NOSTR-NIP05.md`
