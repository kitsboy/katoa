/*
  # Add Country and Location Fields to Wishlists

  ## Changes
  
  1. Add location fields to wishlists table
    - `country` (text) - Country name
    - `country_code` (text) - ISO country code (US, GT, etc.)
    - `city` (text, nullable) - City name
    - `latitude` (numeric, nullable) - For map display
    - `longitude` (numeric, nullable) - For map display
    
  ## Purpose
  Enable country-based filtering and map visualization of wishlists

  ## Security
  These fields are public and visible to all users
*/

-- Add country to wishlists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'country'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN country text;
  END IF;
END $$;

-- Add country_code to wishlists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN country_code text;
  END IF;
END $$;

-- Add city to wishlists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'city'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN city text;
  END IF;
END $$;

-- Add latitude to wishlists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN latitude numeric(10, 7);
  END IF;
END $$;

-- Add longitude to wishlists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlists' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN longitude numeric(10, 7);
  END IF;
END $$;

-- Create index for country filtering
CREATE INDEX IF NOT EXISTS idx_wishlists_country ON wishlists(country);
CREATE INDEX IF NOT EXISTS idx_wishlists_country_code ON wishlists(country_code);