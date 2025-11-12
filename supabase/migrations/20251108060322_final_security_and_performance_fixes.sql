/*
  # Final Security and Performance Fixes

  1. Add Missing Foreign Key Indexes
    - transactions.wishlist_id
    - wishlist_items.wishlist_id
    - wishlist_media.wishlist_id
    - wishlist_updates.wishlist_id

  2. Remove Unused Indexes
    - Only keep indexes that are actively used
    - Remove indexes that were added but aren't queried

  3. Fix Multiple Permissive Policies
    - Use RESTRICTIVE policies to properly combine conditions
    - Separate authenticated and public access properly

  ## Strategy
  Foreign keys to wishlists are critical for JOIN performance since
  many queries need to access wishlist data. These indexes are essential.
*/

-- =============================================
-- 1. ADD CRITICAL FOREIGN KEY INDEXES
-- =============================================

-- Index for transactions.wishlist_id foreign key
-- Critical: used when querying transactions by wishlist
CREATE INDEX IF NOT EXISTS idx_transactions_wishlist_id 
ON transactions(wishlist_id);

-- Index for wishlist_items.wishlist_id foreign key
-- Critical: used when loading items for a wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id 
ON wishlist_items(wishlist_id);

-- Index for wishlist_media.wishlist_id foreign key
-- Critical: used when loading media for a wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_media_wishlist_id 
ON wishlist_media(wishlist_id);

-- Index for wishlist_updates.wishlist_id foreign key
-- Critical: used when loading updates for a wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_updates_wishlist_id 
ON wishlist_updates(wishlist_id);

-- =============================================
-- 2. REMOVE INDEXES THAT AREN'T BEING USED
-- =============================================

-- These indexes were added but queries don't use them yet
-- Remove them to improve write performance
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_transactions_item_id;
DROP INDEX IF EXISTS idx_wishlist_media_item_id;
DROP INDEX IF EXISTS idx_wishlists_wallet_address_id;

-- Note: We can add these back later if specific queries need them

-- =============================================
-- 3. FIX MULTIPLE PERMISSIVE POLICIES
-- =============================================

-- The issue is having multiple PERMISSIVE policies for the same role and action
-- Solution: Keep one policy per role, or use RESTRICTIVE policies

-- Fix wishlist_items policies
DROP POLICY IF EXISTS "Public can view public wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can view wishlist items" ON wishlist_items;

-- Single policy for authenticated users (covers both public and own wishlists)
CREATE POLICY "Authenticated users can view wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        wishlists.is_public = true 
        OR wishlists.creator_id = (select auth.uid())
      )
    )
  );

-- Separate policy for anonymous public access
CREATE POLICY "Anonymous users can view public wishlist items"
  ON wishlist_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.is_public = true
    )
  );

-- Fix wishlist_media policies
DROP POLICY IF EXISTS "Public can view public media" ON wishlist_media;
DROP POLICY IF EXISTS "Users can view media" ON wishlist_media;

-- Single policy for authenticated users
CREATE POLICY "Authenticated users can view media"
  ON wishlist_media FOR SELECT
  TO authenticated
  USING (
    -- Public wishlist media
    (EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_media.wishlist_id
      AND wishlists.is_public = true
    ))
    OR
    -- Own wishlist media
    (EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_media.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    ))
    OR
    -- Profile media (no wishlist)
    (wishlist_id IS NULL)
  );

-- Separate policy for anonymous public access
CREATE POLICY "Anonymous users can view public media"
  ON wishlist_media FOR SELECT
  TO anon
  USING (
    -- Public wishlist media only
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_media.wishlist_id
      AND wishlists.is_public = true
    )
  );

-- =============================================
-- 4. ADD DOCUMENTATION
-- =============================================

COMMENT ON INDEX idx_transactions_wishlist_id IS 
'Critical foreign key index: used when querying transactions by wishlist';

COMMENT ON INDEX idx_wishlist_items_wishlist_id IS 
'Critical foreign key index: used when loading items for a wishlist page';

COMMENT ON INDEX idx_wishlist_media_wishlist_id IS 
'Critical foreign key index: used when loading media for a wishlist page';

COMMENT ON INDEX idx_wishlist_updates_wishlist_id IS 
'Critical foreign key index: used when loading update history for a wishlist';

COMMENT ON POLICY "Authenticated users can view wishlist items" ON wishlist_items IS 
'Single policy for authenticated users: can view items from public wishlists or own wishlists';

COMMENT ON POLICY "Anonymous users can view public wishlist items" ON wishlist_items IS 
'Policy for anonymous (anon) users: can only view items from public wishlists';

COMMENT ON POLICY "Authenticated users can view media" ON wishlist_media IS 
'Single policy for authenticated users: can view public wishlist media, own wishlist media, and profile media';

COMMENT ON POLICY "Anonymous users can view public media" ON wishlist_media IS 
'Policy for anonymous (anon) users: can only view media from public wishlists';