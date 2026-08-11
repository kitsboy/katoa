# Edge Function stub — NIP-07 challenge login

**Status:** scaffold only. Deploy on Supabase when ready (needs Cam/THOR).

## Flow

1. `POST /nostr-auth-challenge` → `{ challenge, expires_at }`
2. Client signs kind 22242 (or custom) event with NIP-07 containing challenge
3. `POST /nostr-auth-verify` with signed event → create Supabase session / magic link

## Why not live yet

Using pubkey-as-password is unsafe. This function must verify signatures server-side.

## Files to add later

- `index.ts` with Deno serve
- Shared secret / JWT minting aligned with Supabase Auth
- Rate limits + replay protection on `challenge`
