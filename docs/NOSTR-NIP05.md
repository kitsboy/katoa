# KATOA NIP-05 & Nostr surface

## Platform identity

| Handle | Meaning |
|--------|---------|
| `katoa@katoa.org` | Primary platform identity |
| `_@katoa.org` | Root / same key (common client convention) |

- **npub:** `npub1349w8xkkjphzwtnhsaez2w6ehxhgwy58zppcql6x2ktqlmqwgssqqpyukn`
- **hex:** `8d4ae39ad6906e272e778772253b59b9ae8712871043807f4655960fec0e4420`
- **Static file:** `public/.well-known/nostr.json` (copied to CF Pages as-is)
- **Secret key:** generated once offline → `.nostr-platform-secret.local.json` (gitignored). Store on THOR vault only; never commit.

### Why a dedicated platform key?

Creators keep their own NIP-07 keys. The platform key is only for `katoa@katoa.org` brand verification and optional platform announcements — not for user custody.

## Creator handles (future)

Claiming `alice@katoa.org`:

1. Creator links NIP-07 pubkey in Settings (hex or npub).
2. Ops (or a future Edge Function) appends `"alice": "<hex>"` to `names` and relay hints under `relays`.
3. Redeploy static file **or** serve dynamic JSON from a worker keyed by Supabase `profiles.username` → `nostr_pubkey`.

Until automation exists, open a GitHub issue / ops request with username + npub.

## Relays (client defaults)

**Kept (CSP original):** damus, nostr.band, nos.lol, snort, nostr.wine  

**Added:** primal.net (discovery), purplepag.es (NIP-65 outbox), nostr.bg (EU write)

Rationale: keep spam-tolerant free relays for reach; primal/purplepag.es improve profile + outbox discovery; never drop the original five without migration.

## Client code

`src/lib/nostr.ts` — NIP-07 only, NIP-65 resolve, NIP-57 zap request/receipt validation, NIP-04 DMs (compat).

## Verify

```bash
curl -sI https://katoa.org/.well-known/nostr.json | head
curl -sL https://katoa.org/.well-known/nostr.json | jq .
# Clients: search katoa@katoa.org in any NIP-05 capable app
```
