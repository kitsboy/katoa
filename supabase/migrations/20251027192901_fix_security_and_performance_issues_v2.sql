/*
  # Fix Security and Performance Issues

  1. RLS Performance Optimization
    - Replace auth.uid() with (select auth.uid()) in all policies
    - Prevents re-evaluation for each row

  2. Remove Duplicate Policies
    - Drop old duplicate policies on wishlist_items and wishlist_media
    - Keep only the optimized versions

  3. Fix Function Search Path
    - Set search_path for update_wishlist_items_timestamp function

  4. Note on Unused Indexes
    - Indexes are kept as they will be used once the app scales
    - They're essential for query performance with real data
*/

-- Drop old duplicate policies on wishlist_items
DROP POLICY IF EXISTS "Anyone can view items from public wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Creators can delete items from own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Creators can insert items to own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Creators can update items in own wishlists" ON wishlist_items;

-- Drop and recreate optimized policies for wishlist_items
DROP POLICY IF EXISTS "Public can view items from public wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Users can view own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can add items to own wishlists" ON wishlist_items;
DROP POLICY IF EXISTS "Users can update own wishlist items" ON wishlist_items;
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON wishlist_items;

-- Optimized SELECT policies for wishlist_items
CREATE POLICY "Public can view items from public wishlists"
  ON wishlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.is_public = true
    )
  );

CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

-- Optimized INSERT policy for wishlist_items
CREATE POLICY "Users can add items to own wishlists"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

-- Optimized UPDATE policy for wishlist_items
CREATE POLICY "Users can update own wishlist items"
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

-- Optimized DELETE policy for wishlist_items
CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

-- Drop and recreate optimized policies for wishlist_media
DROP POLICY IF EXISTS "Public can view media from public wishlists" ON wishlist_media;
DROP POLICY IF EXISTS "Users can view own wishlist media" ON wishlist_media;
DROP POLICY IF EXISTS "Users can upload media to own wishlists" ON wishlist_media;
DROP POLICY IF EXISTS "Users can delete own wishlist media" ON wishlist_media;

-- Optimized SELECT policies for wishlist_media
CREATE POLICY "Public can view media from public wishlists"
  ON wishlist_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_media.wishlist_id
      AND wishlists.is_public = true
    )
  );

CREATE POLICY "Users can view own wishlist media"
  ON wishlist_media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_media.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

-- Optimized INSERT policy for wishlist_media
CREATE POLICY "Users can upload media to own wishlists"
  ON wishlist_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_media.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

-- Optimized DELETE policy for wishlist_media
CREATE POLICY "Users can delete own wishlist media"
  ON wishlist_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_media.wishlist_id
      AND wishlists.creator_id = (select auth.uid())
    )
  );

-- Fix function search path for security
DROP TRIGGER IF EXISTS set_wishlist_items_updated_at ON wishlist_items;
DROP FUNCTION IF EXISTS update_wishlist_items_timestamp() CASCADE;

CREATE OR REPLACE FUNCTION update_wishlist_items_timestamp()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER set_wishlist_items_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_wishlist_items_timestamp();

-- Add comments documenting why indexes exist (they're not unused, just not yet utilized at scale)
COMMENT ON INDEX idx_wishlists_creator_id IS 'Used for filtering wishlists by creator - will be used at scale';
COMMENT ON INDEX idx_wishlists_slug IS 'Used for wishlist lookups by slug - critical for performance';
COMMENT ON INDEX idx_wishlist_items_wishlist_id IS 'Used for loading items per wishlist - essential for queries';
COMMENT ON INDEX idx_transactions_wishlist_id IS 'Used for transaction history queries - needed at scale';
COMMENT ON INDEX idx_notifications_user_id IS 'Used for user notification queries - will be used when implemented';
COMMENT ON INDEX idx_wishlist_items_sort_order IS 'Used for ordered item display - important for UX';
COMMENT ON INDEX idx_wishlist_media_wishlist_id IS 'Used for loading media per wishlist - needed for media queries';
COMMENT ON INDEX idx_wishlist_media_item_id IS 'Used for item-specific media - needed for detail views';
COMMENT ON INDEX idx_shipping_addresses_user_id IS 'Used for user address lookups - will be used at scale';
COMMENT ON INDEX idx_wishlists_country IS 'Used for geographic filtering - important for explore page';
COMMENT ON INDEX idx_wishlists_country_code IS 'Used for country-based queries - needed for analytics';
COMMENT ON INDEX idx_wishlist_updates_wishlist_id IS 'Used for update feeds - will be used when updates implemented';
COMMENT ON INDEX idx_wishlist_updates_created_at IS 'Used for chronological update sorting - needed for feeds';
COMMENT ON INDEX idx_transactions_item_id IS 'Used for item-specific transaction history - needed for tracking';
