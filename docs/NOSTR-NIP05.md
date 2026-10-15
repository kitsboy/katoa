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

## Family namespace direction (future)

Katoa should eventually recognize a shared Give A Bit namespace, using canonical handles such as `alice@giveabit.io` across Katoa, MotoPass, Satohash, Stranded, SherpaCarta, OpenStrata, Tadbuy, giveabit.io, and HQ. A bare `@giveabit` is a product phrase; NIP-05 needs a full `name@domain` address.

The registry should map one public key to a handle and may include relay hints, product availability, role (`human`, `agent`, or `service`), delegated parent key, scopes, expiry, and revocation. Katoa must not automatically merge accounts or treat NIP-05 as legal identity.

Buzz’s useful ideas for this future layer are signed event history, separate keys for agents, scoped permissions, and human approval. Buzz’s full relay/workspace architecture is out of scope for Katoa.

MotoPass passport references and Satohash timestamps should be optional, separate proof layers. NIP-05 says “this domain controls this mapping”; it does not say “this person passed KYC.”

## Creator handles — generated from profile state (2026-10-15)

Claiming `alice@katoa.org`:

1. Creator links an NIP-07 pubkey in **Settings → Link NIP-07**, or on `/nip05` while signed in
   (that page writes `profiles.nostr_pubkey`; the local claim copy is only the signed-out fallback).
2. `npm run nip05` (`scripts/generate-nip05.ts`, run by `npm run build`) reads profile state and
   writes `public/.well-known/nostr.json`:
   - `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (or the `SUPABASE_*` names) present → mode
     `profiles`: rows with a valid NIP-05 name and a 64-hex pubkey are published, each skip is logged
     with its reason.
   - No credentials → mode `baseline`: the committed file is reproduced **byte for byte** (verified), so
     a credential-less build never dirties the tree or drops the platform identity.
3. Deploy serves the generated file from `dist/.well-known/nostr.json`.

Rules enforced by `src/lib/nip05Registry.ts` (9 tests): the committed platform entries always win a name
collision, `_` and `katoa` are reserved, names must match the NIP-05 local-part charset (lowercase,
`a-z0-9-_.`, ≤63 chars), pubkeys must be 64 hex, and duplicates collapse.

### Still open (ops / THOR)

A claim only appears **after a deploy**. Serving the registry dynamically (a Pages Function or Worker keyed
to the same profile state) removes that lag; until then a claim is a profile write plus the next build.

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
