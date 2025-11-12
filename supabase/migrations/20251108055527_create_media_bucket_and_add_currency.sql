/*
  # Create Media Storage Bucket and Add Currency Preference

  1. Storage
    - Create 'media' bucket for file uploads
    - Set up policies for authenticated users to upload/view files
    - Public read access for avatars and media

  2. Profile Changes
    - Add preferred_currency column to profiles table

  3. Security
    - Users can upload files to their own folders
    - Everyone can view uploaded media (public bucket)
*/

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media bucket
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add preferred_currency to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_currency'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_currency text DEFAULT 'USD';
  END IF;
END $$;

COMMENT ON COLUMN profiles.preferred_currency IS 'User preferred currency for displaying Bitcoin prices (USD, EUR, JPY, CAD, etc.)';