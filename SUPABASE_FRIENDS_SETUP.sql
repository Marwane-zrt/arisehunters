
-- ============================================================================
-- FRIENDS SYSTEM TABLE SETUP
-- Run this script to create the missing 'friends' and 'friend_requests' tables
-- which are required for the leaderboard functionality.
-- ============================================================================

-- Function to update updated_at timestamp (reuse if exists or create)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_user_id, to_user_id)
);

-- Enable RLS on friend_requests
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Friend requests policies
CREATE POLICY "Users can create friend requests"
    ON public.friend_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view their own friend requests (sent or received)"
    ON public.friend_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can update their own friend requests (sent or received)"
    ON public.friend_requests
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can delete their own friend requests (sent or received)"
    ON public.friend_requests
    FOR DELETE
    TO authenticated
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Create trigger to update updated_at for friend_requests
DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON public.friend_requests;
CREATE TRIGGER update_friend_requests_updated_at
    BEFORE UPDATE ON public.friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create friends table
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    friend_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_user_id)
);

-- Enable RLS on friends
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Friends policies
CREATE POLICY "Users can view their own friends"
    ON public.friends
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = friend_user_id);

CREATE POLICY "Users can insert friends"
    ON public.friends
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendships"
    ON public.friends
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = friend_user_id);

CREATE POLICY "Users can delete their own friendships"
    ON public.friends
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = friend_user_id);

-- Create trigger to update updated_at for friends
DROP TRIGGER IF EXISTS update_friends_updated_at ON public.friends;
CREATE TRIGGER update_friends_updated_at
    BEFORE UPDATE ON public.friends
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON public.friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON public.friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON public.friend_requests(status);

CREATE INDEX IF NOT EXISTS idx_friends_user ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON public.friends(friend_user_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);

-- ============================================================================
-- RE-RUN LEADERBOARD FUNCTIONS
-- After creating the tables, we must re-run the leaderboard functions
-- to ensure they properly reference the now-existing tables.
-- ============================================================================

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

-- Grant permissions again just in case
GRANT EXECUTE ON FUNCTION get_friends_leaderboard(uuid) TO authenticated;
