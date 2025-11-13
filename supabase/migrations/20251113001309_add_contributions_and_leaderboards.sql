/*
  # Add Contributions History and Donor Recognition

  1. New Tables
    - `contributions`
      - `id` (uuid, primary key)
      - `wishlist_id` (uuid, foreign key)
      - `contributor_id` (uuid, foreign key, nullable) - Registered user
      - `contributor_name` (text) - Display name
      - `contributor_email` (text, nullable) - For receipts
      - `amount_sats` (bigint) - Contribution amount
      - `message` (text) - Optional message
      - `is_anonymous` (boolean) - Hide identity
      - `payment_hash` (text) - Lightning payment hash
      - `status` (text) - pending, completed, failed
      - `metadata` (jsonb) - Additional data
      - `created_at` (timestamptz)
    
    - `wishlist_supporters`
      - `id` (uuid, primary key)
      - `wishlist_id` (uuid, foreign key)
      - `supporter_id` (uuid, foreign key)
      - `total_contributed` (bigint) - Total sats contributed
      - `contribution_count` (integer) - Number of contributions
      - `first_contribution_at` (timestamptz)
      - `last_contribution_at` (timestamptz)
      - `badges` (text[]) - Achievement badges
      - `is_featured` (boolean) - Show on wishlist page
    
    - `leaderboard_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `period` (text) - all_time, monthly, weekly
      - `total_contributed` (bigint)
      - `wishlists_supported` (integer)
      - `rank` (integer)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public can read non-anonymous contributions
    - Only contribution owners can update/delete
    - Leaderboard is public
*/

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  contributor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  contributor_name text DEFAULT 'Anonymous',
  contributor_email text,
  amount_sats bigint NOT NULL,
  message text DEFAULT '',
  is_anonymous boolean DEFAULT false,
  payment_hash text,
  status text DEFAULT 'pending',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view non-anonymous contributions"
  ON contributions FOR SELECT
  TO public
  USING (is_anonymous = false OR auth.uid() = contributor_id);

CREATE POLICY "Anyone can create contributions"
  ON contributions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Contributors can update their contributions"
  ON contributions FOR UPDATE
  TO authenticated
  USING (auth.uid() = contributor_id)
  WITH CHECK (auth.uid() = contributor_id);

-- Wishlist supporters aggregate table
CREATE TABLE IF NOT EXISTS wishlist_supporters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  supporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_contributed bigint DEFAULT 0,
  contribution_count integer DEFAULT 0,
  first_contribution_at timestamptz DEFAULT now(),
  last_contribution_at timestamptz DEFAULT now(),
  badges text[] DEFAULT ARRAY[]::text[],
  is_featured boolean DEFAULT false,
  UNIQUE(wishlist_id, supporter_id)
);

ALTER TABLE wishlist_supporters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view supporters"
  ON wishlist_supporters FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can manage supporters"
  ON wishlist_supporters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update supporters"
  ON wishlist_supporters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Leaderboard entries table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  period text NOT NULL DEFAULT 'all_time',
  total_contributed bigint DEFAULT 0,
  wishlists_supported integer DEFAULT 0,
  rank integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period)
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_entries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can manage leaderboard"
  ON leaderboard_entries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update leaderboard"
  ON leaderboard_entries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contributions_wishlist ON contributions(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor ON contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributions_created ON contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlist_supporters_wishlist ON wishlist_supporters(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_supporters_total ON wishlist_supporters(total_contributed DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period_rank ON leaderboard_entries(period, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON leaderboard_entries(user_id);
