/*
  # Add Media Updates to Wishlists

  ## Changes
  
  1. Create new table `wishlist_updates`
    - `id` (uuid, primary key)
    - `wishlist_id` (uuid, foreign key to wishlists)
    - `title` (text) - Update title
    - `content` (text) - Text content of the update
    - `media_type` (text) - Type: 'text', 'image', 'audio'
    - `media_url` (text, nullable) - URL to image or audio file
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
  2. Security
    - Enable RLS on wishlist_updates table
    - Allow public read access for updates on public wishlists
    - Only wishlist owners can create/update/delete their updates

  ## Purpose
  Allow wishlist owners to post updates (text, images, audio) to keep supporters informed
*/

-- Create wishlist_updates table
CREATE TABLE IF NOT EXISTS wishlist_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  media_type text NOT NULL DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'audio')),
  media_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE wishlist_updates ENABLE ROW LEVEL SECURITY;

-- Public can view updates for public wishlists
CREATE POLICY "Anyone can view updates for public wishlists"
  ON wishlist_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_updates.wishlist_id
      AND wishlists.is_public = true
    )
  );

-- Authenticated users can view updates for their own wishlists
CREATE POLICY "Users can view updates for their own wishlists"
  ON wishlist_updates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_updates.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

-- Only wishlist owners can insert updates
CREATE POLICY "Wishlist owners can create updates"
  ON wishlist_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_updates.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

-- Only wishlist owners can update their updates
CREATE POLICY "Wishlist owners can update their updates"
  ON wishlist_updates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_updates.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_updates.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

-- Only wishlist owners can delete updates
CREATE POLICY "Wishlist owners can delete updates"
  ON wishlist_updates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_updates.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_wishlist_updates_wishlist_id ON wishlist_updates(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_updates_created_at ON wishlist_updates(created_at DESC);