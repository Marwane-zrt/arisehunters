/*
  # Fix user_profiles and categories relationship

  1. Database Changes
    - Add foreign key constraint linking categories to user_profiles via user_id
    - This enables Supabase to understand the relationship for join queries

  2. Security
    - No changes to existing RLS policies
    - Maintains existing data integrity

  3. Notes
    - Both tables already have user_id columns referencing auth.users
    - This creates a direct relationship path for PostgREST queries
    - Enables the LeaderboardView component to fetch user profiles with their categories
*/

-- Add foreign key constraint to link categories to user_profiles
-- This allows Supabase to understand the relationship for join queries
ALTER TABLE categories
ADD CONSTRAINT fk_categories_user_profiles
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
ON DELETE CASCADE;