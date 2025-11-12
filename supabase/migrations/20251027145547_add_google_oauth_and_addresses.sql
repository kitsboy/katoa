/*
  # Add Google OAuth Support and Private Shipping Addresses

  ## Changes
  
  1. New Fields in Profiles
    - Add OAuth provider tracking
    - Add shipping address fields (private)
    
  2. New Table: shipping_addresses
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key) - Links to profiles
    - `full_name` (text) - Recipient name
    - `address_line1` (text) - Street address
    - `address_line2` (text, nullable) - Apt/Suite
    - `city` (text)
    - `state` (text)
    - `postal_code` (text)
    - `country` (text)
    - `phone` (text, nullable)
    - `is_default` (boolean) - Default shipping address
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  3. Update wishlist_items table
    - Add product_url field for external links
    - Add shipping_required boolean
    
  ## Security
  - Shipping addresses are ONLY visible to the owner
  - RLS policies enforce strict access control
  - Public cannot see any address information
*/

-- Add OAuth provider to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'auth_provider'
  ) THEN
    ALTER TABLE profiles ADD COLUMN auth_provider text DEFAULT 'email';
  END IF;
END $$;

-- Create shipping_addresses table
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text DEFAULT 'United States' NOT NULL,
  phone text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Users can only view their own addresses
CREATE POLICY "Users can view own addresses"
  ON shipping_addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
  ON shipping_addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON shipping_addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON shipping_addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add product_url to wishlist_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'product_url'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN product_url text;
  END IF;
END $$;

-- Add shipping_required to wishlist_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist_items' AND column_name = 'shipping_required'
  ) THEN
    ALTER TABLE wishlist_items ADD COLUMN shipping_required boolean DEFAULT true;
  END IF;
END $$;

-- Create index for shipping addresses
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);

-- Add trigger for shipping_addresses updated_at
CREATE TRIGGER update_shipping_addresses_updated_at BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE shipping_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_default_address
  BEFORE INSERT OR UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();