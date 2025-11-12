/*
  # Wishlist Items and Media Support

  1. New Tables
    - `wishlist_items`
      - Stores individual items/products in a wishlist
      - Links to product URLs with parsed info
      - Tracks funding progress per item
    
    - `wishlist_media`
      - Stores uploaded images, videos, documents
      - Can be attached to wishlist or specific items
      - Supports captions and metadata

  2. Security
    - Enable RLS on both tables
    - Public can view items on public wishlists
    - Only creators can manage their items and media

  3. Storage
    - Create bucket for media files
*/

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  price_sats bigint DEFAULT 0,
  sats_raised bigint DEFAULT 0,
  product_url text,
  merchant text,
  image_url text,
  thumbnail_url text,
  currency text DEFAULT 'USD',
  original_price numeric(10, 2),
  is_funded boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wishlist_media table
CREATE TABLE IF NOT EXISTS wishlist_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES wishlist_items(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video', 'document')),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  caption text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_sort_order ON wishlist_items(wishlist_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_wishlist_media_wishlist_id ON wishlist_media(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_media_item_id ON wishlist_media(item_id);

-- Enable RLS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wishlist_items
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
      AND wishlists.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to own wishlists"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own wishlist items"
  ON wishlist_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

-- RLS Policies for wishlist_media
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
      AND wishlists.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload media to own wishlists"
  ON wishlist_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_media.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own wishlist media"
  ON wishlist_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_media.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('wishlist-media', 'wishlist-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view wishlist media'
  ) THEN
    CREATE POLICY "Public can view wishlist media"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'wishlist-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload wishlist media'
  ) THEN
    CREATE POLICY "Authenticated users can upload wishlist media"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'wishlist-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update own wishlist media storage'
  ) THEN
    CREATE POLICY "Users can update own wishlist media storage"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'wishlist-media' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own wishlist media storage'
  ) THEN
    CREATE POLICY "Users can delete own wishlist media storage"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'wishlist-media' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- Update trigger function
CREATE OR REPLACE FUNCTION update_wishlist_items_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_wishlist_items_updated_at'
  ) THEN
    CREATE TRIGGER set_wishlist_items_updated_at
      BEFORE UPDATE ON wishlist_items
      FOR EACH ROW
      EXECUTE FUNCTION update_wishlist_items_timestamp();
  END IF;
END $$;
