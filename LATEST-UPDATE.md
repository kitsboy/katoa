# katoa — Last Updated 2026-09-22 by Buffy

**Brief:** Hardened Google OAuth with PKCE and added a staged, server-verified Nostr challenge login without activating live auth infrastructure.

**Done:**
- Supabase browser auth now explicitly uses PKCE with persistent sessions and token refresh.
- Google OAuth now uses a safe internal callback route and rejects unsafe `next` redirects; unnecessary offline/forced-consent parameters were removed.
- Added server-verified Nostr challenge login source: NIP-07 kind `22242`, short expiration, domain binding, atomic replay protection, and Supabase token exchange.
- Added staged migration and Edge Function source; no Supabase migration, provider credential, secret, or deployment was changed.
- Added auth security tests.

**Verification:** 313 tests passed across 47 files; typecheck, lint, security gate, build, 26/26 prerendered routes, and source/dist asset-reference guards passed. Existing Vite chunk-size, dynamic-import, and Browserslist warnings remain non-blocking.

**Git state:** Auth hardening commit and final handoff stamp are being pushed to `origin/main`. Nostr remains implemented-but-not-deployed pending Supabase review and configuration. No X/Twitter provider was added.
