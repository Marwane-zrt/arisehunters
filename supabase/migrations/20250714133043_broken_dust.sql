/*
  # Fix Friends RLS Policy Violation

  This migration resolves the Row-Level Security policy violation that occurs when accepting friend requests.

  ## Changes Made

  1. **Database Trigger**: Creates a trigger that automatically inserts the inverse friendship record
     - When user A creates a friendship with user B, the trigger automatically creates the inverse record (B -> A)
     - This ensures bidirectional relationships while respecting RLS policies

  2. **RLS Policy Update**: Ensures the INSERT policy only allows users to insert their own friendship records
     - Users can only insert records where `user_id = auth.uid()`
     - The trigger handles creating the inverse record with proper permissions

  ## Security
  - Maintains RLS protection by only allowing users to insert their own records
  - Uses a trigger function with elevated permissions to create inverse records
  - Prevents duplicate friendships and maintains data integrity
*/

-- Create a function to handle bidirectional friendship creation
CREATE OR REPLACE FUNCTION create_bidirectional_friendship()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the inverse friendship record if it doesn't already exist
  INSERT INTO friends (user_id, friend_user_id, status, created_at, updated_at)
  SELECT NEW.friend_user_id, NEW.user_id, NEW.status, NEW.created_at, NEW.updated_at
  WHERE NOT EXISTS (
    SELECT 1 FROM friends 
    WHERE user_id = NEW.friend_user_id 
    AND friend_user_id = NEW.user_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_bidirectional_friendship ON friends;

-- Create the trigger
CREATE TRIGGER trigger_create_bidirectional_friendship
  AFTER INSERT ON friends
  FOR EACH ROW
  EXECUTE FUNCTION create_bidirectional_friendship();

-- Update the RLS policy for INSERT to be more restrictive
DROP POLICY IF EXISTS "Users can create their own friendships" ON friends;

CREATE POLICY "Users can create their own friendships"
  ON friends
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Ensure SELECT policy allows viewing friendships in both directions
DROP POLICY IF EXISTS "Users can view their own friendships" ON friends;

CREATE POLICY "Users can view their own friendships"
  ON friends
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR friend_user_id = auth.uid());

-- Ensure UPDATE policy allows updating friendships
DROP POLICY IF EXISTS "Users can update their own friendships" ON friends;

CREATE POLICY "Users can update their own friendships"
  ON friends
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR friend_user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR friend_user_id = auth.uid());

-- Ensure DELETE policy allows removing friendships
DROP POLICY IF EXISTS "Users can delete their own friendships" ON friends;

CREATE POLICY "Users can delete their own friendships"
  ON friends
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR friend_user_id = auth.uid());