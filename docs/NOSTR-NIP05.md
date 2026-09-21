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

Known family agent identities:

| Handle | Role | Rule |
|---|---|---|
| `kimi@giveabit.io` | HERMES orchestration agent | Own Nostr key; separate email and NIP-05 facts |
| `otto@giveabit.io` | GROK BOT/code agent | Own Nostr key; never impersonate Kimi |
| `katoa@giveabit.io` | Katoa service identity | Service announcements only; not a human |

These are role labels, not legal identity claims. The registry should show whether an identity is a human, agent, or service and what products/scopes it can use.

A Katoa account should only link a NIP-05 handle after resolving the domain and verifying control of the mapped public key with a signed challenge. A typed handle is not proof.

The registry should map one public key to a handle and may include relay hints, product availability, role (`human`, `agent`, or `service`), delegated parent key, scopes, expiry, and revocation. Katoa must not automatically merge accounts or treat NIP-05 as legal identity.

For HERMES/GROK operations, use signed proposals and human approval for new mappings, scope changes, wallet/payment changes, releases, and public attestations. Keep private keys in their owning agent’s secure runtime; publish only public keys, scopes, and revocation state.

Buzz’s useful ideas for this future layer are signed event history, separate keys for agents, scoped permissions, and human approval. Buzz’s full relay/workspace architecture is out of scope for Katoa.

MotoPass passport references and Satohash timestamps should be optional, separate proof layers. NIP-05 says “this domain controls this mapping”; it does not say “this person passed KYC.”

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
