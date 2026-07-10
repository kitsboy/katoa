/*
  Security hardening from 2026-07-09 audit.

  1. Transactions: clients may only insert pending gifts (no completed/confirmed)
  2. Contributions: remove unrestricted public insert
  3. Supporters / leaderboard: remove open authenticated write policies
  4. Notifications: remove open insert for clients
  5. Visibility: private lists not listable; public RPC for single-slug access
  6. Profiles: public read of non-sensitive columns
  7. Storage media: enforce owner folder on INSERT
  8. SECURITY DEFINER functions: lock search_path
  9. user_follows alias view for schema name alignment
*/

-- ---------------------------------------------------------------------------
-- 1. Transactions — no client-set final payment status
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated can insert pending transactions" ON public.transactions;

CREATE POLICY "Authenticated can insert pending transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND amount_sats > 0
    AND amount_sats <= 2100000000000000
  );

-- Block client updates that could mark gifts paid (no existing update policy is ideal)
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;

-- ---------------------------------------------------------------------------
-- 2. Contributions — no public spam inserts
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can create contributions" ON public.contributions;
DROP POLICY IF EXISTS "Authenticated can insert pending contributions" ON public.contributions;

CREATE POLICY "Authenticated can insert pending contributions"
  ON public.contributions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (status IS NULL OR status = 'pending')
    AND amount_sats > 0
    AND (contributor_id IS NULL OR contributor_id = (SELECT auth.uid()))
  );

-- ---------------------------------------------------------------------------
-- 3. Supporters / leaderboard — system (service role) only; drop open writes
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "System can manage supporters" ON public.wishlist_supporters;
DROP POLICY IF EXISTS "System can update supporters" ON public.wishlist_supporters;
DROP POLICY IF EXISTS "System can manage leaderboard" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "System can update leaderboard" ON public.leaderboard_entries;

-- ---------------------------------------------------------------------------
-- 4. Notifications — no client inserts for arbitrary users
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- ---------------------------------------------------------------------------
-- 5. Wishlists / projects visibility — private not enumerable
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "View wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Anyone can view public wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Anyone can view private wishlists via direct link" ON public.wishlists;
DROP POLICY IF EXISTS "Owner can view own wishlists" ON public.wishlists;

CREATE POLICY "View public or own wishlists"
  ON public.wishlists
  FOR SELECT
  TO public
  USING (
    visibility = 'public'
    OR creator_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "View projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can view public projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can view private projects via direct link" ON public.projects;
DROP POLICY IF EXISTS "Owner can view own projects" ON public.projects;

CREATE POLICY "View public or own projects"
  ON public.projects
  FOR SELECT
  TO public
  USING (
    visibility = 'public'
    OR creator_id = (SELECT auth.uid())
  );

-- Payment methods: public projects only (or owner)
DROP POLICY IF EXISTS "View payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Anyone can view payment methods for public projects" ON public.payment_methods;
DROP POLICY IF EXISTS "Anyone can view payment methods for private projects" ON public.payment_methods;
DROP POLICY IF EXISTS "Owner can view own project payment methods" ON public.payment_methods;

CREATE POLICY "View payment methods for public or own projects"
  ON public.payment_methods
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = payment_methods.project_id
      AND (
        projects.visibility = 'public'
        OR projects.creator_id = (SELECT auth.uid())
      )
    )
  );

-- Single-slug access for public + private (unlisted) without listing all private rows
CREATE OR REPLACE FUNCTION public.get_wishlist_by_slug(p_slug text)
RETURNS SETOF public.wishlists
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT w.*
  FROM public.wishlists w
  WHERE w.slug = p_slug
    AND (
      w.visibility IN ('public', 'private')
      OR w.creator_id = auth.uid()
    )
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_wishlist_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_wishlist_by_slug(text) TO anon, authenticated;

-- Items/media for unlisted (private) wishlists: readable if parent is public or private (not draft), or owner
-- Prevents draft leakage while allowing direct-link private pages to load items
DROP POLICY IF EXISTS "Anyone can view items from public wishlists" ON public.wishlist_items;
DROP POLICY IF EXISTS "Public can view items from public wishlists" ON public.wishlist_items;
DROP POLICY IF EXISTS "Authenticated users can view wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Anonymous users can view public wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can view wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can view own wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "Public can view public wishlist items" ON public.wishlist_items;
DROP POLICY IF EXISTS "View wishlist items" ON public.wishlist_items;

CREATE POLICY "View items on published or own wishlists"
  ON public.wishlist_items
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists w
      WHERE w.id = wishlist_items.wishlist_id
      AND (
        w.visibility IN ('public', 'private')
        OR w.creator_id = (SELECT auth.uid())
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 6. Profiles — public read of profile rows (no emails on this table)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

CREATE POLICY "Public can view profiles"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);

-- ---------------------------------------------------------------------------
-- 7. Storage media — owner folder required on INSERT
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;

CREATE POLICY "Authenticated users can upload media to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- ---------------------------------------------------------------------------
-- 8. SECURITY DEFINER search_path locks
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'update_funding_totals'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.update_funding_totals() SET search_path = public, pg_temp';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'create_notification'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.create_notification(uuid, text, text, text) SET search_path = public, pg_temp';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'notify_on_gift'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.notify_on_gift() SET search_path = public, pg_temp';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'increment_view_count'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.increment_view_count(uuid) SET search_path = public, pg_temp';
  END IF;
END $$;

-- Funding trigger should only run on confirmed (not client-forged completed from old clients)
DROP TRIGGER IF EXISTS trg_update_funding ON public.transactions;
CREATE TRIGGER trg_update_funding
  AFTER INSERT OR UPDATE OF status ON public.transactions
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION public.update_funding_totals();

DROP TRIGGER IF EXISTS trg_notify_on_gift ON public.transactions;
CREATE TRIGGER trg_notify_on_gift
  AFTER UPDATE OF status ON public.transactions
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed')
  EXECUTE FUNCTION public.notify_on_gift();

-- ---------------------------------------------------------------------------
-- 9. Schema alias: follows ↔ user_follows
-- ---------------------------------------------------------------------------
-- Client code uses `follows` (migration table name). view optional if tools expect user_follows.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'follows'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public' AND table_name = 'user_follows'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_follows'
  ) THEN
    EXECUTE 'CREATE VIEW public.user_follows AS SELECT * FROM public.follows';
  END IF;
END $$;
