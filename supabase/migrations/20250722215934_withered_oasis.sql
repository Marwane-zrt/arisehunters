/*
  # Add RLS policy for leaderboard functionality

  1. Security Changes
    - Add policy to allow authenticated users to read all categories
    - This enables the leaderboard to calculate correct ranks for all users
    - Existing policies for managing own categories remain unchanged

  2. Policy Details
    - Name: "Allow authenticated users to view all categories for leaderboard"
    - Command: SELECT only
    - Target: authenticated users
    - Condition: true (allows reading all categories)

  This policy is essential for the leaderboard to display accurate ranks by allowing
  it to sum up category points for all users, not just the current user.
*/

-- Add policy to allow authenticated users to read all categories
-- This is needed for the leaderboard to calculate correct ranks for all users
CREATE POLICY "Allow authenticated users to view all categories for leaderboard"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);