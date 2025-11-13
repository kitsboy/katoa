/*
  # Add Projects Structure
  
  ## Overview
  Restructures the application to have Projects as the top-level entity.
  Users create Projects, and each Project can contain multiple Wishlists.
  
  ## Changes
  
  1. New Tables
    - `projects` - Top-level container for wishlists
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `slug` (text, unique)
      - `background_url` (text) - Custom background image
      - `wallet_address` (text) - Bitcoin wallet for this project
      - `lightning_address` (text) - Lightning address
      - `nostr_pubkey` (text) - Nostr public key
      - `visibility` (enum: public, private, draft)
      - `settings` (jsonb) - Additional project settings
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Modified Tables
    - `wishlists` - Add project_id foreign key
      - `project_id` (uuid, references projects)
      - Keep existing creator_id for backwards compatibility
  
  3. Security
    - Enable RLS on projects table
    - Owners can manage their own projects
    - Public projects viewable by everyone
    - Private projects only via direct link
    - Draft projects only visible to owner
  
  ## Migration Strategy
  - Create projects table
  - Add project_id to wishlists
  - Create default project for existing wishlists
  - Set up RLS policies
*/

-- Create visibility type for projects (reuse existing if available)
DO $$ BEGIN
  CREATE TYPE project_visibility AS ENUM ('public', 'private', 'draft');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  slug text UNIQUE NOT NULL,
  background_url text,
  wallet_address text,
  lightning_address text,
  nostr_pubkey text,
  visibility project_visibility DEFAULT 'draft' NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add project_id to wishlists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishlists' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE wishlists 
    ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_creator ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON projects(visibility);
CREATE INDEX IF NOT EXISTS idx_wishlists_project ON wishlists(project_id);

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects

-- SELECT policies
CREATE POLICY "Anyone can view public projects"
  ON projects FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Owner can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can view private projects via direct link"
  ON projects FOR SELECT
  USING (visibility = 'private');

-- INSERT policies
CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- UPDATE policies
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- DELETE policies
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create default projects for existing wishlists
-- This ensures backwards compatibility
INSERT INTO projects (creator_id, title, description, slug, visibility, created_at)
SELECT DISTINCT 
  w.creator_id,
  'My Project',
  'Default project for existing wishlists',
  'project-' || w.creator_id || '-' || extract(epoch from now())::text,
  'public'::project_visibility,
  min(w.created_at)
FROM wishlists w
WHERE NOT EXISTS (
  SELECT 1 FROM projects p WHERE p.creator_id = w.creator_id
)
GROUP BY w.creator_id
ON CONFLICT DO NOTHING;

-- Link existing wishlists to their owner's default project
UPDATE wishlists w
SET project_id = (
  SELECT p.id 
  FROM projects p 
  WHERE p.creator_id = w.creator_id 
  LIMIT 1
)
WHERE project_id IS NULL;