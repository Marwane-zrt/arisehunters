-- ============================================================================
-- DELETE ACCOUNT FUNCTION SETUP
-- Run this script to enable the "Delete Account" functionality.
-- ============================================================================

-- Create the delete_user function that allows users to delete their own account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the user from auth.users
  -- This will cascade to all other tables (profiles, habits, etc.) 
  -- because of ON DELETE CASCADE constraints
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Grant functionality to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Verify it works by running a rapid check (optional, just ensuring no syntax errors)
DO $$
BEGIN
  RAISE NOTICE 'Delete user function created successfully';
END
$$;
