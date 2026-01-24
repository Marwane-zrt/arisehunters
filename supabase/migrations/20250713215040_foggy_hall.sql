/*
  # Create Friends System

  1. New Tables
    - `friends`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles.user_id)
      - `friend_user_id` (uuid, references user_profiles.user_id)
      - `status` (text, default 'accepted')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `friend_requests`
      - `id` (uuid, primary key)
      - `from_user_id` (uuid, references user_profiles.user_id)
      - `to_user_id` (uuid, references user_profiles.user_id)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own friends and requests
    - Add indexes for efficient querying

  3. Foreign Key Constraints
    - Link friend_requests to user_profiles via from_user_id and to_user_id
    - Link friends to user_profiles via user_id and friend_user_id
*/

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_user_id uuid NOT NULL,
  status text DEFAULT 'accepted',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_user_id)
);

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

-- Add foreign key constraints for friends table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friends_user_id_fkey'
  ) THEN
    ALTER TABLE friends 
    ADD CONSTRAINT friends_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friends_friend_user_id_fkey'
  ) THEN
    ALTER TABLE friends 
    ADD CONSTRAINT friends_friend_user_id_fkey 
    FOREIGN KEY (friend_user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraints for friend_requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friend_requests_from_user_id_fkey'
  ) THEN
    ALTER TABLE friend_requests 
    ADD CONSTRAINT friend_requests_from_user_id_fkey 
    FOREIGN KEY (from_user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friend_requests_to_user_id_fkey'
  ) THEN
    ALTER TABLE friend_requests 
    ADD CONSTRAINT friend_requests_to_user_id_fkey 
    FOREIGN KEY (to_user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_user_id ON friends(friend_user_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

CREATE INDEX IF NOT EXISTS idx_friend_requests_from_user_id ON friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user_id ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- RLS Policies for friends table
CREATE POLICY "Users can view their own friendships"
  ON friends
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()) OR friend_user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own friendships"
  ON friends
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own friendships"
  ON friends
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()) OR friend_user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own friendships"
  ON friends
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()) OR friend_user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()));

-- RLS Policies for friend_requests table
CREATE POLICY "Users can view their own friend requests"
  ON friend_requests
  FOR SELECT
  TO authenticated
  USING (from_user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()) OR to_user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create friend requests"
  ON friend_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update friend requests they received"
  ON friend_requests
  FOR UPDATE
  TO authenticated
  USING (to_user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own friend requests"
  ON friend_requests
  FOR DELETE
  TO authenticated
  USING (from_user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()) OR to_user_id = (SELECT user_id FROM user_profiles WHERE user_id = auth.uid()));