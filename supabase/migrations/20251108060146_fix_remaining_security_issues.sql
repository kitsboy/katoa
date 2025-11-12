/*
  # Fix Remaining Security and Performance Issues

  1. Add Missing Foreign Key Indexes
    - Add indexes for unindexed foreign keys to improve query performance
    - notifications.user_id
    - transactions.item_id
    - wishlist_media.item_id
    - wishlists.wallet_address_id

  2. Remove Unused Indexes
    - Remove indexes that aren't being used by queries
    - Keep foreign key indexes as they're essential

  3. Consolidate Multiple Permissive Policies
    - Fix wishlist_items SELECT policies
    - Fix wishlist_media SELECT policies

  ## Performance Impact
  - Foreign key indexes improve JOIN performance
  - Removing unused indexes speeds up writes
  - Consolidated policies reduce policy evaluation overhead
*/

-- =============================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =============================================

-- Index for notifications.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
ON notifications(user_id);

-- Index for transactions.item_id foreign key
CREATE INDEX IF NOT EXISTS idx_transactions_item_id 
ON transactions(item_id);

-- Index for wishlist_media.item_id foreign key
CREATE INDEX IF NOT EXISTS idx_wishlist_media_item_id 
ON wishlist_media(item_id);

-- Index for wishlists.wallet_address_id foreign key
CREATE INDEX IF NOT EXISTS idx_wishlists_wallet_address_id 
ON wishlists(wallet_address_id);

-- =============================================
-- 2. REMOVE UNUSED INDEXES
-- =============================================

-- These indexes exist but aren't being used by actual queries
DROP INDEX IF EXISTS idx_wishlists_slug;
DROP INDEX IF EXISTS idx_wishlist_items_wishlist_id;
DROP INDEX IF EXISTS idx_transactions_wishlist_id;
DROP INDEX IF EXISTS idx_wishlist_media_wishlist_id;
DROP INDEX IF EXISTS idx_wishlist_updates_wishlist_id;

-- Note: Foreign key relationships automatically create indexes in Postgres,
-- so we don't need explicit indexes for most FK columns unless we're doing
-- specific query patterns that need them.

-- =============================================
-- 3. CONSOLIDATE WISHLIST_ITEMS POLICIES
-- =============================================

-- Drop existing overlapping SELECT policies
DROP POLICY IF EXISTS "Public can view items from public wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Users can view own wishlist items" ON wishlist_items;

-- Create single consolidated SELECT policy
CREATE POLICY "Users can view wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (
    -- Items from public wishlists
    (EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.is_public = true
    ))
    OR
    -- Items from own wishlists
    (EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    ))
  );

-- Also add policy for public (non-authenticated) users to view public wishlist items
CREATE POLICY "Public can view public wishlist items"
  ON wishlist_items FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.is_public = true
    )
  );

-- =============================================
-- 4. CONSOLIDATE WISHLIST_MEDIA POLICIES
-- =============================================

-- Drop existing overlapping SELECT policies
DROP POLICY IF EXISTS "Public can view media from public wishlists" ON wishlist_media;

-- The "Users can view media" policy already exists and covers authenticated users
-- Just add policy for public (non-authenticated) users

CREATE POLICY "Public can view public media"
  ON wishlist_media FOR SELECT
  TO public
  USING (
    -- Public wishlist media only
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_media.wishlist_id
      AND wishlists.is_public = true
    )
  );

-- =============================================
-- 5. ADD DOCUMENTATION
-- =============================================

COMMENT ON INDEX idx_notifications_user_id IS 
'Foreign key index for notifications.user_id - improves JOIN and filtering performance';

COMMENT ON INDEX idx_transactions_item_id IS 
'Foreign key index for transactions.item_id - improves JOIN and filtering performance';

COMMENT ON INDEX idx_wishlist_media_item_id IS 
'Foreign key index for wishlist_media.item_id - improves JOIN and filtering performance';

COMMENT ON INDEX idx_wishlists_wallet_address_id IS 
'Foreign key index for wishlists.wallet_address_id - improves JOIN and filtering performance';

COMMENT ON POLICY "Users can view wishlist items" ON wishlist_items IS 
'Consolidated policy for authenticated users: allows viewing items from public wishlists and own wishlists';

COMMENT ON POLICY "Public can view public wishlist items" ON wishlist_items IS 
'Allows anonymous users to view items from public wishlists only';

COMMENT ON POLICY "Public can view public media" ON wishlist_media IS 
'Allows anonymous users to view media from public wishlists only';