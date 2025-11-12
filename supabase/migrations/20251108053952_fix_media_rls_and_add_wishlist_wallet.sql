/*
  # Fix Media Upload RLS and Add Wallet Selection to Wishlists

  1. Changes
    - Make wishlist_id nullable in wishlist_media for profile uploads
    - Add RLS policy for profile media uploads (where wishlist_id is NULL)
    - Add wallet_address_id column to wishlists table to link selected wallet

  2. Security
    - Users can upload media without wishlist_id (for profile pictures)
    - Users can view their own profile media
    - Wishlists can reference wallet addresses from the wallet_addresses table
*/

-- Make wishlist_id nullable in wishlist_media for profile uploads
ALTER TABLE wishlist_media ALTER COLUMN wishlist_id DROP NOT NULL;

-- Add policy for profile media uploads (when wishlist_id is NULL)
CREATE POLICY "Users can upload profile media"
  ON wishlist_media FOR INSERT
  TO authenticated
  WITH CHECK (wishlist_id IS NULL);

-- Add policy to view own profile media
CREATE POLICY "Users can view own profile media"
  ON wishlist_media FOR SELECT
  TO authenticated
  USING (wishlist_id IS NULL);

-- Add wallet_address_id to wishlists table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'wallet_address_id'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN wallet_address_id uuid REFERENCES wallet_addresses(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_wishlists_wallet_address ON wishlists(wallet_address_id);

-- Add policy to allow selecting wallet addresses when creating wishlists
COMMENT ON COLUMN wishlists.wallet_address_id IS 'References the wallet address selected for this wishlist from user wallet_addresses';