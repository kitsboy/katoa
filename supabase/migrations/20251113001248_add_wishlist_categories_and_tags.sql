/*
  # Add Wishlist Categories and Tags System

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Category name
      - `slug` (text, unique) - URL-friendly slug
      - `icon` (text) - Lucide icon name
      - `color` (text) - Hex color code
      - `description` (text) - Category description
      - `created_at` (timestamptz)
    
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Tag name
      - `slug` (text, unique) - URL-friendly slug
      - `usage_count` (integer) - Number of times used
      - `created_at` (timestamptz)
    
    - `wishlist_categories`
      - `wishlist_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - Primary key: (wishlist_id, category_id)
    
    - `wishlist_tags`
      - `wishlist_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - Primary key: (wishlist_id, tag_id)

  2. Security
    - Enable RLS on all tables
    - Public can read categories and tags
    - Authenticated users can add categories/tags to their wishlists
    - Only table owners/admins can create new categories
    - Any authenticated user can create tags
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text DEFAULT 'Tag',
  color text DEFAULT '#f97316',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update tag usage"
  ON tags FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Wishlist categories junction table
CREATE TABLE IF NOT EXISTS wishlist_categories (
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (wishlist_id, category_id)
);

ALTER TABLE wishlist_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wishlist categories"
  ON wishlist_categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Wishlist owners can manage categories"
  ON wishlist_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

CREATE POLICY "Wishlist owners can remove categories"
  ON wishlist_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

-- Wishlist tags junction table
CREATE TABLE IF NOT EXISTS wishlist_tags (
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (wishlist_id, tag_id)
);

ALTER TABLE wishlist_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wishlist tags"
  ON wishlist_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Wishlist owners can add tags"
  ON wishlist_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

CREATE POLICY "Wishlist owners can remove tags"
  ON wishlist_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

-- Insert default categories
INSERT INTO categories (name, slug, icon, color, description) VALUES
  ('Birthday', 'birthday', 'Cake', '#ec4899', 'Birthday gifts and celebrations'),
  ('Wedding', 'wedding', 'Heart', '#8b5cf6', 'Wedding registries and gifts'),
  ('Baby', 'baby', 'Baby', '#06b6d4', 'Baby showers and newborn essentials'),
  ('Holiday', 'holiday', 'Gift', '#10b981', 'Holiday and seasonal wishlists'),
  ('Education', 'education', 'GraduationCap', '#3b82f6', 'Educational materials and courses'),
  ('Technology', 'technology', 'Laptop', '#6366f1', 'Tech gadgets and electronics'),
  ('Travel', 'travel', 'Plane', '#14b8a6', 'Travel funds and adventures'),
  ('Charity', 'charity', 'Heart', '#f59e0b', 'Charitable causes and donations'),
  ('Gaming', 'gaming', 'Gamepad2', '#a855f7', 'Gaming equipment and accessories'),
  ('Fitness', 'fitness', 'Dumbbell', '#ef4444', 'Fitness equipment and health')
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_categories_wishlist ON wishlist_categories(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_categories_category ON wishlist_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_tags_wishlist ON wishlist_tags(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_tags_tag ON wishlist_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_usage ON tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
