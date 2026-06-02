/*
  # Add Hunter Search RPC
  
  1. New Functions
    - `search_hunter_by_id(target_id text)` - Returns a user profile matching the unique 8-digit ID.
  
  2. Security
    - Uses SECURITY DEFINER to bypass RLS, ensuring that users can always find their friends by ID even if user_profiles table has restrictive SELECT policies.
*/

CREATE OR REPLACE FUNCTION search_hunter_by_id(target_id text)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  unique_id text,
  nickname text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    up.unique_id,
    up.nickname,
    up.created_at,
    up.updated_at
  FROM user_profiles up
  WHERE up.unique_id = target_id
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION search_hunter_by_id(text) TO authenticated;
