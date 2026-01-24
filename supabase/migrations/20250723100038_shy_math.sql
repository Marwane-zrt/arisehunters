/*
  # Fix Leaderboard RLS and Add Server-Side Functions

  1. Security Updates
    - Fix categories RLS policy to prevent data leakage
    - Ensure users can only see their own categories
  
  2. New Functions
    - `get_global_leaderboard()` - Returns global user rankings
    - `get_user_rank(user_id)` - Returns specific user's rank
    - `calculate_user_total_points(user_id)` - Calculates user's total points
  
  3. Performance
    - Add indexes for better query performance
    - Optimize ranking calculations
*/

-- First, fix the categories RLS policy that's causing the data leakage
DROP POLICY IF EXISTS "Allow authenticated users to view all categories for leaderboar" ON categories;

-- Create a proper RLS policy for categories (users can only see their own)
CREATE POLICY "Users can view their own categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function to calculate total points for a specific user
CREATE OR REPLACE FUNCTION calculate_user_total_points(target_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_points integer := 0;
BEGIN
  SELECT COALESCE(SUM(points), 0)
  INTO total_points
  FROM categories
  WHERE user_id = target_user_id;
  
  RETURN total_points;
END;
$$;

-- Function to get global leaderboard with proper rankings
CREATE OR REPLACE FUNCTION get_global_leaderboard()
RETURNS TABLE (
  user_id uuid,
  unique_id text,
  nickname text,
  total_points integer,
  global_rank integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_points AS (
    SELECT 
      up.user_id,
      up.unique_id,
      up.nickname,
      calculate_user_total_points(up.user_id) as total_points
    FROM user_profiles up
    WHERE up.unique_id IS NOT NULL
  ),
  ranked_users AS (
    SELECT 
      up.user_id,
      up.unique_id,
      up.nickname,
      up.total_points,
      ROW_NUMBER() OVER (ORDER BY up.total_points DESC, up.user_id) as global_rank
    FROM user_points up
  )
  SELECT 
    ru.user_id,
    ru.unique_id,
    ru.nickname,
    ru.total_points,
    ru.global_rank::integer
  FROM ranked_users ru
  ORDER BY ru.global_rank;
END;
$$;

-- Function to get a specific user's rank
CREATE OR REPLACE FUNCTION get_user_rank(target_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  unique_id text,
  nickname text,
  total_points integer,
  global_rank integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_points AS (
    SELECT 
      up.user_id,
      up.unique_id,
      up.nickname,
      calculate_user_total_points(up.user_id) as total_points
    FROM user_profiles up
    WHERE up.unique_id IS NOT NULL
  ),
  ranked_users AS (
    SELECT 
      up.user_id,
      up.unique_id,
      up.nickname,
      up.total_points,
      ROW_NUMBER() OVER (ORDER BY up.total_points DESC, up.user_id) as global_rank
    FROM user_points up
  )
  SELECT 
    ru.user_id,
    ru.unique_id,
    ru.nickname,
    ru.total_points,
    ru.global_rank::integer
  FROM ranked_users ru
  WHERE ru.user_id = target_user_id;
END;
$$;

-- Function to get friends leaderboard for a specific user
CREATE OR REPLACE FUNCTION get_friends_leaderboard(target_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  unique_id text,
  nickname text,
  total_points integer,
  friends_rank integer,
  is_current_user boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH friend_user_ids AS (
    -- Get all friend user IDs for the target user, plus the target user themselves
    SELECT target_user_id as friend_user_id
    UNION
    SELECT f.friend_user_id
    FROM friends f
    WHERE f.user_id = target_user_id AND f.status = 'accepted'
    UNION
    SELECT f.user_id
    FROM friends f
    WHERE f.friend_user_id = target_user_id AND f.status = 'accepted'
  ),
  friend_points AS (
    SELECT 
      up.user_id,
      up.unique_id,
      up.nickname,
      calculate_user_total_points(up.user_id) as total_points
    FROM user_profiles up
    INNER JOIN friend_user_ids fui ON up.user_id = fui.friend_user_id
    WHERE up.unique_id IS NOT NULL
  ),
  ranked_friends AS (
    SELECT 
      fp.user_id,
      fp.unique_id,
      fp.nickname,
      fp.total_points,
      ROW_NUMBER() OVER (ORDER BY fp.total_points DESC, fp.user_id) as friends_rank,
      (fp.user_id = target_user_id) as is_current_user
    FROM friend_points fp
  )
  SELECT 
    rf.user_id,
    rf.unique_id,
    rf.nickname,
    rf.total_points,
    rf.friends_rank::integer,
    rf.is_current_user
  FROM ranked_friends rf
  ORDER BY rf.friends_rank;
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id_points ON categories(user_id, points);
CREATE INDEX IF NOT EXISTS idx_user_profiles_points_lookup ON user_profiles(user_id) WHERE unique_id IS NOT NULL;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION calculate_user_total_points(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_global_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_rank(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_friends_leaderboard(uuid) TO authenticated;