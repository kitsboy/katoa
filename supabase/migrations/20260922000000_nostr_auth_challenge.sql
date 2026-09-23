/* Staged Nostr login storage. Apply only after reviewing the Edge Function. */

CREATE TABLE IF NOT EXISTS public.nostr_auth_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge text NOT NULL,
  domain text NOT NULL,
  username text,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  used_pubkey text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS nostr_auth_challenges_value_domain_unique
  ON public.nostr_auth_challenges (challenge, domain);
CREATE INDEX IF NOT EXISTS nostr_auth_challenges_expiry_idx
  ON public.nostr_auth_challenges (expires_at);
ALTER TABLE public.nostr_auth_challenges ENABLE ROW LEVEL SECURITY;

/* No browser-readable or browser-writable policies: service role only. */

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nostr_pubkey_verified boolean NOT NULL DEFAULT false;
