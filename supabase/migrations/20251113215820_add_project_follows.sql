/*
  # Add Project Following System
  
  ## Overview
  Adds the ability for users to follow projects, in addition to following users and wishlists.
  
  ## Changes
  
  1. New Tables
    - `project_follows`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles) - User following the project
      - `project_id` (uuid, references projects) - Project being followed
      - `created_at` (timestamptz)
      - Unique constraint on (user_id, project_id)
  
  2. Security
    - Enable RLS on project_follows table
    - Users can view all project follows
    - Users can create/delete their own follows
  
  3. Indexes
    - Index on user_id for fast user follow lookups
    - Index on project_id for fast project follower counts
*/

-- Create project_follows table
CREATE TABLE IF NOT EXISTS project_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, project_id)
);

-- Enable RLS
ALTER TABLE project_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_follows

-- SELECT policy
CREATE POLICY "Users can view all project follows"
  ON project_follows FOR SELECT
  TO authenticated
  USING (true);

-- INSERT policy
CREATE POLICY "Users can create their own project follows"
  ON project_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete their own project follows"
  ON project_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_follows_user ON project_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_project_follows_project ON project_follows(project_id);
