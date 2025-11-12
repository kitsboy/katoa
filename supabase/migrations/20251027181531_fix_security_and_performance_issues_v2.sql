/*
  # Fix Security and Performance Issues

  ## Changes
  
  1. Add missing index for transactions.item_id foreign key
  2. Fix all RLS policies to use (select auth.uid()) pattern for better performance
  3. Fix function search_path issues
  4. Consolidate duplicate policies on wishlist_updates
  
  ## Security & Performance
  All optimizations maintain the same security guarantees while improving query performance
*/

-- Add missing index for transactions.item_id foreign key
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON transactions(item_id);

-- Fix function search paths
DO $$
BEGIN
  ALTER FUNCTION update_updated_at_column() SET search_path = pg_catalog, public;
  ALTER FUNCTION ensure_single_default_address() SET search_path = pg_catalog, public;
EXCEPTION
  WHEN undefined_function THEN NULL;
END $$;

-- Drop existing RLS policies that need to be recreated with optimized pattern
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view public wishlists" ON wishlists;
DROP POLICY IF EXISTS "Creators can insert own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Creators can update own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Creators can delete own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Anyone can view items from public wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Creators can insert items to own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Creators can update items in own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Creators can delete items from own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Creators can view transactions for own wishlists" ON transactions;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Anyone can view updates for public wishlists" ON wishlist_updates;
DROP POLICY IF EXISTS "Users can view updates for their own wishlists" ON wishlist_updates;
DROP POLICY IF EXISTS "Wishlist owners can create updates" ON wishlist_updates;
DROP POLICY IF EXISTS "Wishlist owners can update their updates" ON wishlist_updates;
DROP POLICY IF EXISTS "Wishlist owners can delete updates" ON wishlist_updates;

-- Recreate profiles policies with optimized pattern
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Recreate wishlists policies with optimized pattern
CREATE POLICY "Anyone can view public wishlists"
  ON wishlists FOR SELECT
  USING (
    is_public = true 
    OR creator_id = (select auth.uid())
  );

CREATE POLICY "Creators can insert own wishlists"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "Creators can update own wishlists"
  ON wishlists FOR UPDATE
  TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "Creators can delete own wishlists"
  ON wishlists FOR DELETE
  TO authenticated
  USING (creator_id = (select auth.uid()));

-- Recreate wishlist_items policies with optimized pattern
CREATE POLICY "Anyone can view items from public wishlists"
  ON wishlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (wishlists.is_public = true OR wishlists.creator_id = (select auth.uid()))
    )
  );

CREATE POLICY "Creators can insert items to own wishlists"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

CREATE POLICY "Creators can update items in own wishlists"
  ON wishlist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

CREATE POLICY "Creators can delete items from own wishlists"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

-- Recreate transactions policies with optimized pattern
CREATE POLICY "Creators can view transactions for own wishlists"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = transactions.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

-- Recreate notifications policies with optimized pattern
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Recreate shipping_addresses policies with optimized pattern
CREATE POLICY "Users can view own addresses"
  ON shipping_addresses FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own addresses"
  ON shipping_addresses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own addresses"
  ON shipping_addresses FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own addresses"
  ON shipping_addresses FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recreate wishlist_updates policies with optimized pattern
-- Consolidate the two SELECT policies into one
CREATE POLICY "Anyone can view updates for public wishlists"
  ON wishlist_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_updates.wishlist_id
      AND (wishlists.is_public = true OR wishlists.creator_id = (select auth.uid()))
    )
  );

CREATE POLICY "Wishlist owners can create updates"
  ON wishlist_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_updates.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

CREATE POLICY "Wishlist owners can update their updates"
  ON wishlist_updates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_updates.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_updates.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

CREATE POLICY "Wishlist owners can delete updates"
  ON wishlist_updates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_updates.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );