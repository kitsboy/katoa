/*
  # Add Subscriptions (subscriber-only feed gate)

  Spec: docs/SUBSCRIPTION-FLOW-SPEC.md

  1. New Tables
    - `subscriptions`
      - `subscriber_id` (uuid, references profiles) - the fan
      - `creator_id` (uuid, references profiles) - the creator they paid
      - `tier_id` (text) `price_sats` (bigint) `status` (pending|active|expired|cancelled)
      - `active_until` (timestamptz, null = never expires)
      - `invoice_id` (text) - the settled Lightning invoice this row came from
      - at most one row per (subscriber, creator)

  2. Security
    - RLS enabled. A fan may READ their own rows; a creator may read rows for
      their own content. Nobody can INSERT/UPDATE/DELETE from a browser: only
      the service role (the webhook, after signature verification) may write an
      activation. That is what stops the client from unlocking locked posts.
    - `cancel_my_subscription()` is SECURITY DEFINER and can only move a row the
      caller owns from `active` to `cancelled` - it cannot activate anything.

  3. Notes
    - Free follows stay in `wishlist_follows`; a paid subscription is a row here
      with status='active'. Locked content unlocks on `status='active'` and
      (`active_until IS NULL OR active_until > now()`).
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier_id text NOT NULL,
  price_sats bigint NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  active_until timestamptz,
  invoice_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subscriber_id, creator_id),
  CHECK (subscriber_id != creator_id),
  CHECK (tier_id <> ''),
  CHECK (price_sats > 0),
  CHECK (status IN ('pending', 'active', 'expired', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber
  ON subscriptions (subscriber_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_creator
  ON subscriptions (creator_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_invoice
  ON subscriptions (invoice_id)
  WHERE invoice_id IS NOT NULL;

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Fans read their own subscription rows.
CREATE POLICY "Subscribers can view their own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = subscriber_id);

-- Creators can see who subscribed to their content (counts / supporter lists).
CREATE POLICY "Creators can view subscriptions to their content"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

-- No INSERT/UPDATE/DELETE policies on purpose: a browser session must never be
-- able to mint or reactivate a subscription. The webhook writes with the service
-- role, which bypasses RLS.

CREATE OR REPLACE FUNCTION cancel_my_subscription(p_creator_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_creator_id uuid;
  v_rows integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT id INTO v_creator_id FROM profiles WHERE username = p_creator_username;
  IF v_creator_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE subscriptions
     SET status = 'cancelled', updated_at = now()
   WHERE subscriber_id = auth.uid()
     AND creator_id = v_creator_id
     AND status IN ('pending', 'active');

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

REVOKE ALL ON FUNCTION cancel_my_subscription(text) FROM public;
GRANT EXECUTE ON FUNCTION cancel_my_subscription(text) TO authenticated;
