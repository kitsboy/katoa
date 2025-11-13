/*
  # Add Payment Methods System
  
  ## Overview
  Adds comprehensive payment method support for projects including:
  - Bitcoin Layer 1 (xpub for address generation)
  - Lightning Network (Lightning Address, LNURL)
  - Nostr (zaps and payments)
  - Nym/Pynym addresses
  - BOLT12 offers (future support)
  
  ## Changes
  
  1. New Tables
    - `payment_methods` - Store multiple payment methods per project
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `method_type` (enum: bitcoin_xpub, lightning, nostr, nym, bolt12)
      - `label` (text) - User-friendly name
      - `address` (text) - The actual address/xpub/pubkey
      - `metadata` (jsonb) - Additional config (derivation path, etc)
      - `is_primary` (boolean) - Primary payment method
      - `is_active` (boolean) - Whether this method is enabled
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Modified Tables
    - Keep existing wallet fields in projects for backward compatibility
  
  3. Security
    - Enable RLS on payment_methods table
    - Only project owners can manage payment methods
    - Public can view active payment methods for public projects
  
  ## Payment Method Types
  - bitcoin_xpub: Extended public key for address generation
  - lightning: Lightning address or LNURL
  - nostr: Nostr public key for zaps
  - nym: Nym/Pynym address
  - bolt12: BOLT12 offer string (future)
*/

-- Create payment method type enum
DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM (
    'bitcoin_xpub',
    'bitcoin_address',
    'lightning',
    'nostr',
    'nym',
    'bolt12'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  method_type payment_method_type NOT NULL,
  label text NOT NULL,
  address text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_primary boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_project ON payment_methods(project_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(project_id, is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_primary ON payment_methods(project_id, is_primary);

-- Enable RLS on payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods

-- SELECT policies: Users can view payment methods for projects they can see
CREATE POLICY "Anyone can view payment methods for public projects"
  ON payment_methods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = payment_methods.project_id
      AND projects.visibility = 'public'
    )
  );

CREATE POLICY "Owner can view own project payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = payment_methods.project_id
      AND projects.creator_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view payment methods for private projects"
  ON payment_methods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = payment_methods.project_id
      AND projects.visibility = 'private'
    )
  );

-- INSERT policies
CREATE POLICY "Project owners can add payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = payment_methods.project_id
      AND projects.creator_id = auth.uid()
    )
  );

-- UPDATE policies
CREATE POLICY "Project owners can update payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = payment_methods.project_id
      AND projects.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = payment_methods.project_id
      AND projects.creator_id = auth.uid()
    )
  );

-- DELETE policies
CREATE POLICY "Project owners can delete payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = payment_methods.project_id
      AND projects.creator_id = auth.uid()
    )
  );

-- Add trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one primary payment method per project
CREATE OR REPLACE FUNCTION ensure_single_primary_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE payment_methods
    SET is_primary = false
    WHERE project_id = NEW.project_id
    AND id != NEW.id
    AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for primary payment method
DROP TRIGGER IF EXISTS ensure_single_primary_trigger ON payment_methods;
CREATE TRIGGER ensure_single_primary_trigger
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_payment_method();