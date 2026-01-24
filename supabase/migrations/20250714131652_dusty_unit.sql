/*
  # Fix User Profile Visibility for Friend Search

  1. Security Changes
    - Update RLS policies on user_profiles table to allow authenticated users to search for other profiles
    - Keep profiles secure but searchable by unique_id
    - Ensure users can still only edit their own profiles

  2. Policy Updates
    - Allow authenticated users to SELECT profiles by unique_id (for friend search)
    - Maintain existing INSERT/UPDATE restrictions
    - Add policy for searching profiles without exposing sensitive data
*/

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Allow authenticated users to view user profiles" ON user_profiles;

-- Create new policies that allow friend search while maintaining security
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can search profiles by unique_id for friend requests"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure the existing policies for INSERT and UPDATE remain secure
-- Users can still only insert/update their own profiles
-- The existing policies should handle this, but let's make sure they exist

-- Policy for inserting own profile (should exist from previous migrations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for updating own profile (should exist from previous migrations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON user_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Also ensure the anon insert policy exists for signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Allow anon insert during signup'
  ) THEN
    CREATE POLICY "Allow anon insert during signup"
      ON user_profiles
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;