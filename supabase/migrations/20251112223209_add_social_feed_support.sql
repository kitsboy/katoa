/*
  # Add Social Feed Integration Support

  1. Changes
    - Add social_feed_url column to profiles table for embedding external feeds
    - Add social_feed_title column for custom feed titles
    - Add social_feed_height column for custom feed height
  
  2. Security
    - No new RLS policies needed (inherits from profiles table)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'social_feed_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN social_feed_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'social_feed_title'
  ) THEN
    ALTER TABLE profiles ADD COLUMN social_feed_title text DEFAULT 'My Social Feed';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'social_feed_height'
  ) THEN
    ALTER TABLE profiles ADD COLUMN social_feed_height text DEFAULT '600px';
  END IF;
END $$;
