/*
  # Fix Security and Performance Issues

  This migration addresses critical security and performance issues:

  1. **Missing Foreign Key Indexes**
     - Add indexes on all foreign key columns for optimal query performance
     - Affects: notifications, transactions, wishlist_media, wishlist_supporters, wishlists

  2. **RLS Policy Optimization**
     - Wrap all auth.uid() calls with SELECT to prevent re-evaluation per row
     - Improves query performance at scale
     - Affects: payment_methods, wishlist_categories, wishlist_tags, contributions, follows, wishlist_follows, wishlists, projects

  3. **Function Security**
     - Fix mutable search paths in database functions
     - Prevents potential SQL injection vulnerabilities

  4. **Policy Consolidation**
     - Consolidate multiple permissive policies into single optimized policies
     - Reduces policy evaluation overhead
     - Affects: payment_methods, projects, wishlists
*/

-- Add missing foreign key indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON public.transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_media_item_id ON public.wishlist_media(item_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_supporters_supporter_id ON public.wishlist_supporters(supporter_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_wallet_address_id ON public.wishlists(wallet_address_id);

-- Fix function search paths for security
ALTER FUNCTION public.ensure_single_primary_payment_method() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;

-- Drop existing policies that will be consolidated or optimized
DROP POLICY IF EXISTS "Owner can view own project payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Project owners can add payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Project owners can update payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Project owners can delete payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Anyone can view payment methods for private projects" ON public.payment_methods;
DROP POLICY IF EXISTS "Anyone can view payment methods for public projects" ON public.payment_methods;

DROP POLICY IF EXISTS "Wishlist owners can manage categories" ON public.wishlist_categories;
DROP POLICY IF EXISTS "Wishlist owners can remove categories" ON public.wishlist_categories;

DROP POLICY IF EXISTS "Wishlist owners can add tags" ON public.wishlist_tags;
DROP POLICY IF EXISTS "Wishlist owners can remove tags" ON public.wishlist_tags;

DROP POLICY IF EXISTS "Public can view non-anonymous contributions" ON public.contributions;
DROP POLICY IF EXISTS "Contributors can update their contributions" ON public.contributions;

DROP POLICY IF EXISTS "Users can create their own follows" ON public.follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON public.follows;

DROP POLICY IF EXISTS "Users can create their own wishlist follows" ON public.wishlist_follows;
DROP POLICY IF EXISTS "Users can delete their own wishlist follows" ON public.wishlist_follows;

DROP POLICY IF EXISTS "Owner can view own wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Users can update own wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Creators can update own wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Anyone can view private wishlists via direct link" ON public.wishlists;
DROP POLICY IF EXISTS "Anyone can view public wishlists" ON public.wishlists;

DROP POLICY IF EXISTS "Owner can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can view private projects via direct link" ON public.projects;
DROP POLICY IF EXISTS "Anyone can view public projects" ON public.projects;

-- Recreate optimized payment_methods policies
CREATE POLICY "View payment methods"
  ON public.payment_methods
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = payment_methods.project_id
      AND (
        projects.visibility = 'public'
        OR projects.visibility = 'private'
        OR projects.creator_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "Manage own payment methods"
  ON public.payment_methods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = payment_methods.project_id
      AND projects.creator_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = payment_methods.project_id
      AND projects.creator_id = (SELECT auth.uid())
    )
  );

-- Recreate optimized wishlist_categories policies
CREATE POLICY "Manage own wishlist categories"
  ON public.wishlist_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_categories.wishlist_id
      AND wishlists.creator_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_categories.wishlist_id
      AND wishlists.creator_id = (SELECT auth.uid())
    )
  );

-- Recreate optimized wishlist_tags policies
CREATE POLICY "Manage own wishlist tags"
  ON public.wishlist_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_tags.wishlist_id
      AND wishlists.creator_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_tags.wishlist_id
      AND wishlists.creator_id = (SELECT auth.uid())
    )
  );

-- Recreate optimized contributions policies
CREATE POLICY "View contributions"
  ON public.contributions
  FOR SELECT
  TO public
  USING (
    is_anonymous = false
    OR contributor_id = (SELECT auth.uid())
  );

CREATE POLICY "Update own contributions"
  ON public.contributions
  FOR UPDATE
  TO authenticated
  USING (contributor_id = (SELECT auth.uid()))
  WITH CHECK (contributor_id = (SELECT auth.uid()));

-- Recreate optimized follows policies
CREATE POLICY "Manage own follows"
  ON public.follows
  FOR ALL
  TO authenticated
  USING (follower_id = (SELECT auth.uid()))
  WITH CHECK (follower_id = (SELECT auth.uid()));

-- Recreate optimized wishlist_follows policies
CREATE POLICY "Manage own wishlist follows"
  ON public.wishlist_follows
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Recreate optimized wishlists policies
CREATE POLICY "View wishlists"
  ON public.wishlists
  FOR SELECT
  TO public
  USING (
    visibility = 'public'
    OR visibility = 'private'
    OR creator_id = (SELECT auth.uid())
  );

CREATE POLICY "Manage own wishlists"
  ON public.wishlists
  FOR ALL
  TO authenticated
  USING (creator_id = (SELECT auth.uid()))
  WITH CHECK (creator_id = (SELECT auth.uid()));

-- Recreate optimized projects policies
CREATE POLICY "View projects"
  ON public.projects
  FOR SELECT
  TO public
  USING (
    visibility = 'public'
    OR visibility = 'private'
    OR creator_id = (SELECT auth.uid())
  );

CREATE POLICY "Manage own projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (creator_id = (SELECT auth.uid()))
  WITH CHECK (creator_id = (SELECT auth.uid()));