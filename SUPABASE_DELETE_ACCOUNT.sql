-- Function to allow users to delete their own account
-- This must be run in the Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the user from auth.users
  -- This will cascade to all other tables because of ON DELETE CASCADE
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
