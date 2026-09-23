# Staged Edge Function — NIP-07 challenge login

**Status:** implemented in source, not deployed. Review the migration/function and configure Supabase secrets before activation.

## Flow

1. `POST /nostr-auth-challenge` → `{ challenge, expires_at }`
2. Client signs kind 22242 (or custom) event with NIP-07 containing challenge
3. `POST /nostr-auth-verify` with signed event → create Supabase session / magic link

## Why not live yet

Using pubkey-as-password is unsafe. This function must verify signatures server-side.

## Safety boundary

- `index.ts` verifies NIP-42 signatures server-side, binds events to the KATOA domain, enforces short timestamps/expiration, and consumes each challenge atomically.
- It creates a Supabase user with a synthetic internal email and returns a one-time magic-link token hash; the browser exchanges that token with Supabase Auth.
- The function is not live until the migration is reviewed/applied, `SITE_URL` and `NOSTR_AUTH_ALLOWED_ORIGINS` are set, and the function is deployed.
- Add rate limiting at the Edge/hosting layer before public activation.
