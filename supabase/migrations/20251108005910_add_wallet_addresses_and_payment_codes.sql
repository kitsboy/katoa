/*
  # Add Wallet Addresses and Payment Codes

  1. New Tables
    - `wallet_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `address_type` (text: 'lightning', 'xpub', 'pynym')
      - `address_value` (text)
      - `label` (text) - User's note/label for the address
      - `is_active` (boolean) - Whether this address is currently active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to profiles table
    - Add `xpub_address` (text, nullable)
    - Add `pynym_code` (text, nullable)
    - Add `nostr_pubkey_verified` (boolean, default false)

  3. Security
    - Enable RLS on `wallet_addresses` table
    - Add policies for authenticated users to manage their own addresses
*/

-- Create wallet_addresses table
CREATE TABLE IF NOT EXISTS wallet_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  address_type text NOT NULL CHECK (address_type IN ('lightning', 'xpub', 'pynym')),
  address_value text NOT NULL,
  label text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_addresses_user_id ON wallet_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_addresses_type ON wallet_addresses(address_type);
CREATE INDEX IF NOT EXISTS idx_wallet_addresses_active ON wallet_addresses(is_active);

-- Enable RLS
ALTER TABLE wallet_addresses ENABLE ROW LEVEL SECURITY;

-- Policies for wallet_addresses
CREATE POLICY "Users can view own wallet addresses"
  ON wallet_addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet addresses"
  ON wallet_addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet addresses"
  ON wallet_addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallet addresses"
  ON wallet_addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'xpub_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN xpub_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pynym_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pynym_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'nostr_pubkey_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN nostr_pubkey_verified boolean DEFAULT false;
  END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wallet_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wallet_addresses_updated_at
  BEFORE UPDATE ON wallet_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_addresses_updated_at();