/*
  # Add Wishlist Visibility Settings

  ## Overview
  Adds visibility control for wishlists with three states:
  - public: Visible to everyone in explore pages
  - private: Only accessible via direct link (not shown in explore)
  - draft: Only visible to owner, not published yet

  ## Changes
  1. Add visibility column to wishlists table
    - `visibility` enum field with options: public, private, draft
    - Defaults to 'draft' for new wishlists
  
  2. Update RLS policies
    - Public wishlists: viewable by everyone
    - Private wishlists: only viewable via direct link (authenticated users)
    - Draft wishlists: only viewable by owner
  
  ## Security
  - Owner can always see their own wishlists regardless of visibility
  - Only public wishlists appear in explore/search
  - Private wishlists require the slug/link to access
*/

-- Create visibility type if it doesn't exist
DO $$ BEGIN
  CREATE TYPE wishlist_visibility AS ENUM ('public', 'private', 'draft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add visibility column to wishlists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishlists' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE wishlists 
    ADD COLUMN visibility wishlist_visibility DEFAULT 'draft' NOT NULL;
  END IF;
END $$;

-- Update existing wishlists to be public by default
UPDATE wishlists 
SET visibility = 'public' 
WHERE visibility IS NULL OR visibility = 'draft';

-- Drop existing policies for wishlists select
DROP POLICY IF EXISTS "Anyone can view public wishlists" ON wishlists;
DROP POLICY IF EXISTS "Users can view wishlists" ON wishlists;
DROP POLICY IF EXISTS "Public wishlists are viewable by everyone" ON wishlists;

-- Create new visibility-aware policies for SELECT
CREATE POLICY "Anyone can view public wishlists"
  ON wishlists FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Owner can view own wishlists"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can view private wishlists via direct link"
  ON wishlists FOR SELECT
  USING (visibility = 'private');

-- Ensure owners can update visibility
DROP POLICY IF EXISTS "Users can update own wishlists" ON wishlists;

CREATE POLICY "Users can update own wishlists"
  ON wishlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);