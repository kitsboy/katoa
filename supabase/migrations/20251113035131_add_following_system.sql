/*
  # Add Following System

  1. New Tables
    - `follows`
      - `id` (uuid, primary key)
      - `follower_id` (uuid, references profiles) - User who is following
      - `following_id` (uuid, references profiles) - User being followed
      - `created_at` (timestamp)
      - Unique constraint on (follower_id, following_id)
    
    - `wishlist_follows`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles) - User following the wishlist
      - `wishlist_id` (uuid, references wishlists) - Wishlist being followed
      - `created_at` (timestamp)
      - Unique constraint on (user_id, wishlist_id)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own follows
    - Add policies for users to view public follows
*/

-- Create follows table for profile following
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create wishlist_follows table
CREATE TABLE IF NOT EXISTS wishlist_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wishlist_id uuid NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, wishlist_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_follows ENABLE ROW LEVEL SECURITY;

-- Policies for follows table
CREATE POLICY "Users can view all follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own follows"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Policies for wishlist_follows table
CREATE POLICY "Users can view all wishlist follows"
  ON wishlist_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own wishlist follows"
  ON wishlist_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist follows"
  ON wishlist_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_follows_user ON wishlist_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_follows_wishlist ON wishlist_follows(wishlist_id);
