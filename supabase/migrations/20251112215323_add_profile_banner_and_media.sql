/*
  # Add Profile Banner and Media Support

  1. Changes to profiles table
    - Add `banner_url` column for wide-angle background images
    - Add `banner_video_url` column for background videos
    - Add `profile_video_url` column for profile intro videos
    - Add `video_title` column for video naming
    - Add `video_date` column for video dating
    
  2. Notes
    - All new columns are optional (nullable)
    - These support the enhanced profile customization feature
    - Videos and images stored in existing media bucket
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN banner_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'banner_video_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN banner_video_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_video_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_video_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'video_title'
  ) THEN
    ALTER TABLE profiles ADD COLUMN video_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'video_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN video_date timestamptz;
  END IF;
END $$;
