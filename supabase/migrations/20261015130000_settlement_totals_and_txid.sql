/*
  # Settlement writers: one semantics for funding totals, plus the on-chain txid

  1. The bug this closes
    `transactions` had TWO writers with different maths for the same column:
    the `trg_update_funding` trigger *recomputes* `wishlists.total_sats_raised` as
    `SUM(amount_sats)` over confirmed rows, while the webhook also called the
    additive `increment_funding_totals(...)`. A single settled gift therefore
    jumped the counter by twice its amount, and the error compounds per payment.

  2. The fix
    Totals are only ever recomputed from confirmed rows:
      - `recompute_funding_totals(uuid, uuid)` is the one implementation,
      - `increment_funding_totals(uuid, uuid, bigint)` keeps its signature (so an
        already-deployed webhook keeps working) but now recomputes and ignores
        `p_amount_sats` — it is deprecated, not additive,
      - the trigger function delegates to the same recompute.
    Recompute is idempotent, so a provider retry can never inflate a counter.

  3. New columns
    `transactions.txid` — the on-chain transaction id the provider settled, so the
    creator dashboard can link one specific payment instead of an address history.
*/

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS txid text;

CREATE INDEX IF NOT EXISTS transactions_txid_idx
  ON public.transactions (txid)
  WHERE txid IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS transactions_txid_unique
  ON public.transactions (txid)
  WHERE txid IS NOT NULL;

-- One implementation of "what does this campaign have raised?"CREATE OR REPLACE FUNCTION public.recompute_funding_totals(p_wishlist_id uuid, p_item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_item_id IS NOT NULL THEN
    UPDATE public.wishlist_items
    SET sats_raised = COALESCE((
          SELECT SUM(amount_sats) FROM public.transactions
          WHERE item_id = p_item_id AND status IN ('confirmed', 'completed', 'paid')
        ), 0),
        is_funded = COALESCE((
          SELECT SUM(amount_sats) FROM public.transactions
          WHERE item_id = p_item_id AND status IN ('confirmed', 'completed', 'paid')
        ), 0) >= price_sats,
        updated_at = now()
    WHERE id = p_item_id;
  END IF;

  IF p_wishlist_id IS NOT NULL THEN
    UPDATE public.wishlists
    SET total_sats_raised = COALESCE((
          SELECT SUM(amount_sats) FROM public.transactions
          WHERE wishlist_id = p_wishlist_id AND status IN ('confirmed', 'completed', 'paid')
        ), 0),
        updated_at = now()
    WHERE id = p_wishlist_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.recompute_funding_totals(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recompute_funding_totals(uuid, uuid) TO service_role;

 DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'recompute_funding_totals') THEN
    RAISE EXCEPTION 'The funding totals function this migration depends on is not present. Run the earlier migration that creates it first.';
  END IF;
END $$;



-- Deprecated: keep the signature, drop the additive maths.
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
  -- p_amount_sats is intentionally unused. Totals are always the SUM of the
  -- confirmed rows; adding the amount again double-counts the gift.
  PERFORM public.recompute_funding_totals(p_wishlist_id, p_item_id);
END;
$$;

COMMENT ON FUNCTION public.increment_funding_totals(uuid, uuid, bigint) IS
  'Deprecated: recomputes totals from confirmed transactions and ignores p_amount_sats. Use recompute_funding_totals.';

REVOKE ALL ON FUNCTION public.increment_funding_totals(uuid, uuid, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_funding_totals(uuid, uuid, bigint) TO service_role;

-- The trigger now uses the same implementation, so the two writers cannot drift.
CREATE OR REPLACE FUNCTION public.update_funding_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public.recompute_funding_totals(NEW.wishlist_id, NEW.item_id);
  RETURN NEW;
END;
$$;
