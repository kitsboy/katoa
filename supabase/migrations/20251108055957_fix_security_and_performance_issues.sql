/*
  # Fix Security and Performance Issues

  1. RLS Policy Optimization
    - Update wallet_addresses policies to use (select auth.uid()) for better performance
    - Consolidate multiple permissive policies to reduce complexity

  2. Performance Optimization
    - Remove unused indexes that aren't being utilized
    - Keep only indexes that improve query performance

  3. Security Fixes
    - Fix function search path to be immutable
    - Address RLS policy performance issues

  ## Changes

  ### Wallet Addresses RLS Policies
  - Drop and recreate policies with optimized auth checks

  ### Remove Unused Indexes
  - Clean up indexes that aren't being used by queries

  ### Fix Function Security
  - Update trigger function with secure search path
*/

-- =============================================
-- 1. FIX WALLET_ADDRESSES RLS POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own wallet addresses" ON wallet_addresses;
DROP POLICY IF EXISTS "Users can insert own wallet addresses" ON wallet_addresses;
DROP POLICY IF EXISTS "Users can update own wallet addresses" ON wallet_addresses;
DROP POLICY IF EXISTS "Users can delete own wallet addresses" ON wallet_addresses;

-- Recreate with optimized auth checks
CREATE POLICY "Users can view own wallet addresses"
  ON wallet_addresses FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own wallet addresses"
  ON wallet_addresses FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own wallet addresses"
  ON wallet_addresses FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own wallet addresses"
  ON wallet_addresses FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =============================================
-- 2. CONSOLIDATE WISHLIST_MEDIA POLICIES
-- =============================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Users can view own wishlist media" ON wishlist_media;
DROP POLICY IF EXISTS "Users can view own profile media" ON wishlist_media;
DROP POLICY IF EXISTS "Users can upload media to own wishlists" ON wishlist_media;
DROP POLICY IF EXISTS "Users can upload profile media" ON wishlist_media;

-- Create single consolidated policies
CREATE POLICY "Users can view media"
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

CREATE POLICY "Users can upload media"
  ON wishlist_media FOR INSERT
  TO authenticated
  WITH CHECK (
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

-- =============================================
-- 3. REMOVE UNUSED INDEXES
-- =============================================

-- Remove indexes that aren't being used
DROP INDEX IF EXISTS idx_wishlist_items_sort_order;
DROP INDEX IF EXISTS idx_transactions_item_id;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_wishlist_media_item_id;
DROP INDEX IF EXISTS idx_wishlists_country;
DROP INDEX IF EXISTS idx_wishlists_country_code;
DROP INDEX IF EXISTS idx_wallet_addresses_type;
DROP INDEX IF EXISTS idx_wallet_addresses_active;
DROP INDEX IF EXISTS idx_wishlist_updates_created_at;
DROP INDEX IF EXISTS idx_wishlists_wallet_address;

-- Keep these indexes as they're likely to be used:
-- idx_wishlists_slug (for URL lookups)
-- idx_wishlist_items_wishlist_id (for foreign key performance)
-- idx_transactions_wishlist_id (for transaction queries)
-- idx_wishlist_media_wishlist_id (for media queries)
-- idx_wishlist_updates_wishlist_id (for update queries)
-- idx_wallet_addresses_user_id (for user wallet queries)

-- =============================================
-- 4. FIX FUNCTION SEARCH PATH
-- =============================================

-- Drop and recreate function with secure search path
DROP FUNCTION IF EXISTS update_wallet_addresses_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_wallet_addresses_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS wallet_addresses_updated_at ON wallet_addresses;

CREATE TRIGGER wallet_addresses_updated_at
  BEFORE UPDATE ON wallet_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_addresses_updated_at();

-- =============================================
-- 5. ADD COMMENT FOR DOCUMENTATION
-- =============================================

COMMENT ON POLICY "Users can view media" ON wishlist_media IS 
'Consolidated policy: allows viewing public wishlist media, own wishlist media, and profile media';

COMMENT ON POLICY "Users can upload media" ON wishlist_media IS 
'Consolidated policy: allows uploading to own wishlists or profile (when wishlist_id is NULL)';

COMMENT ON FUNCTION update_wallet_addresses_updated_at() IS 
'Secure function with immutable search_path for updating wallet_addresses timestamps';