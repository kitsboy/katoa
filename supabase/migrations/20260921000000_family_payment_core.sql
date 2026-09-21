/*
  Family Payment Core — staged schema only.

  This migration is safe to review and test locally. It does not configure a
  provider, deploy an Edge Function, or grant the browser settlement authority.
  Only trusted server code should write payment_events or final statuses.
*/

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS rail text,
  ADD COLUMN IF NOT EXISTS intent_id text,
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS transactions_intent_id_unique
  ON public.transactions (intent_id)
  WHERE intent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS transactions_provider_external_id_unique
  ON public.transactions (provider, external_id)
  WHERE provider IS NOT NULL AND external_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.payment_events (
  id text PRIMARY KEY,
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  provider text NOT NULL,
  event_type text NOT NULL,
  state text NOT NULL CHECK (state IN ('intent', 'pending', 'confirming', 'settled', 'expired', 'failed')),
  amount_sats bigint,
  confirmations integer,
  external_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_error text
);

CREATE INDEX IF NOT EXISTS payment_events_transaction_id_idx
  ON public.payment_events (transaction_id, received_at DESC);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Creators can view payment events" ON public.payment_events;
CREATE POLICY "Creators can view payment events"
  ON public.payment_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transactions t
      JOIN public.wishlists w ON w.id = t.wishlist_id
      WHERE t.id = payment_events.transaction_id
        AND w.creator_id = (SELECT auth.uid())
    )
  );

/* Service-role-only writes: no authenticated INSERT/UPDATE policy is created. */

CREATE OR REPLACE FUNCTION public.increment_funding_totals(
  p_wishlist_id uuid,
  p_item_id uuid,
  p_amount_sats bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_amount_sats IS NULL OR p_amount_sats <= 0 THEN
    RAISE EXCEPTION 'amount_sats must be positive';
  END IF;

  IF p_item_id IS NOT NULL THEN
    UPDATE public.wishlist_items
    SET sats_raised = COALESCE(sats_raised, 0) + p_amount_sats,
        is_funded = COALESCE(sats_raised, 0) + p_amount_sats >= price_sats,
        updated_at = now()
    WHERE id = p_item_id;
  END IF;

  IF p_wishlist_id IS NOT NULL THEN
    UPDATE public.wishlists
    SET total_sats_raised = COALESCE(total_sats_raised, 0) + p_amount_sats,
        updated_at = now()
    WHERE id = p_wishlist_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_funding_totals(uuid, uuid, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_funding_totals(uuid, uuid, bigint) TO service_role;
