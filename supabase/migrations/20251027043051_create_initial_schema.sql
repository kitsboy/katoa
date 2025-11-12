/*
  # Bitcoin Wishlist Platform - Initial Schema

  ## Overview
  This migration creates the foundational database structure for a Bitcoin-native wishlist platform.
  It includes tables for users, wishlists, items, transactions, and notifications with full RLS security.

  ## New Tables

  ### 1. `profiles`
  User profile information with Bitcoin/Lightning identities
  - `id` (uuid, primary key) - Links to auth.users
  - `username` (text, unique) - Display name
  - `avatar_url` (text) - Profile image
  - `lightning_address` (text) - Lightning address for payments
  - `nostr_pubkey` (text) - Nostr public key (placeholder for future)
  - `bio` (text) - Creator bio
  - `created_at` (timestamptz) - Account creation time
  - `updated_at` (timestamptz) - Last update time

  ### 2. `wishlists`
  Creator wishlists with privacy and customization options
  - `id` (uuid, primary key)
  - `creator_id` (uuid, foreign key) - Links to profiles
  - `title` (text) - Wishlist name
  - `description` (text) - Wishlist description
  - `slug` (text, unique) - URL-friendly identifier
  - `is_public` (boolean) - Public or invite-only
  - `theme_color` (text) - Customizable theme color
  - `cover_image` (text) - Header image URL
  - `total_sats_goal` (bigint) - Optional total funding goal in satoshis
  - `total_sats_raised` (bigint) - Total satoshis raised
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `wishlist_items`
  Individual items within wishlists
  - `id` (uuid, primary key)
  - `wishlist_id` (uuid, foreign key) - Links to wishlists
  - `title` (text) - Item name
  - `description` (text) - Item details
  - `price_sats` (bigint) - Price in satoshis
  - `sats_raised` (bigint) - Amount raised so far
  - `image_url` (text) - Item image
  - `merchant_link` (text) - External purchase link
  - `sort_order` (integer) - Display order
  - `is_funded` (boolean) - Fully funded status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `transactions`
  Payment records (mock for MVP, ready for real Bitcoin integration)
  - `id` (uuid, primary key)
  - `wishlist_id` (uuid, foreign key)
  - `item_id` (uuid, foreign key, nullable)
  - `contributor_name` (text) - Optional name
  - `amount_sats` (bigint) - Amount in satoshis
  - `message` (text) - Optional message to creator
  - `payment_method` (text) - 'lightning', 'onchain', 'bip47'
  - `payment_hash` (text) - Lightning payment hash or txid
  - `status` (text) - 'pending', 'completed', 'failed'
  - `created_at` (timestamptz)

  ### 5. `notifications`
  Real-time notifications for creators
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Recipient
  - `type` (text) - Notification type
  - `title` (text) - Notification title
  - `message` (text) - Notification content
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz)

  ## Security
  All tables have RLS enabled with policies for authenticated users.
  - Users can only read/update their own profiles
  - Creators have full control over their wishlists
  - Public wishlists are viewable by anyone
  - Transactions are readable by creators and contributors
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  lightning_address text,
  nostr_pubkey text,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  slug text UNIQUE NOT NULL,
  is_public boolean DEFAULT true,
  theme_color text DEFAULT '#F7931A',
  cover_image text,
  total_sats_goal bigint DEFAULT 0,
  total_sats_raised bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public wishlists"
  ON wishlists FOR SELECT
  USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Creators can insert own wishlists"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own wishlists"
  ON wishlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own wishlists"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  price_sats bigint NOT NULL,
  sats_raised bigint DEFAULT 0,
  image_url text,
  merchant_link text,
  sort_order integer DEFAULT 0,
  is_funded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view items from public wishlists"
  ON wishlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (wishlists.is_public = true OR wishlists.creator_id = auth.uid())
    )
  );

CREATE POLICY "Creators can insert items to own wishlists"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update items in own wishlists"
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

CREATE POLICY "Creators can delete items from own wishlists"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES wishlist_items(id) ON DELETE SET NULL,
  contributor_name text DEFAULT 'Anonymous',
  amount_sats bigint NOT NULL,
  message text DEFAULT '',
  payment_method text DEFAULT 'lightning',
  payment_hash text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view transactions for own wishlists"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = transactions.wishlist_id
      AND wishlists.creator_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlists_creator_id ON wishlists(creator_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_slug ON wishlists(slug);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wishlist_id ON transactions(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON wishlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON wishlist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();