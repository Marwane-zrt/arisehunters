/*
  # Create daily penalty logs table

  1. New Tables
    - `daily_penalty_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `check_date` (date, the date penalties were checked for)
      - `penalties_applied` (integer, number of points deducted)
      - `message` (text, summary message about penalties)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `daily_penalty_logs` table
    - Add policy for users to read their own penalty logs

  3. Functions
    - Create function to apply daily penalties for all users
    - Create function to get user's latest penalty message
*/

-- Create daily penalty logs table
CREATE TABLE IF NOT EXISTS daily_penalty_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_date date NOT NULL,
  penalties_applied integer DEFAULT 0,
  message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, check_date)
);

-- Enable RLS
ALTER TABLE daily_penalty_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own penalty logs"
  ON daily_penalty_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_penalty_logs_user_id ON daily_penalty_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_penalty_logs_check_date ON daily_penalty_logs(check_date);

-- Function to apply daily penalties for all users
CREATE OR REPLACE FUNCTION apply_daily_penalties_for_all_users()
RETURNS TABLE(users_processed integer, total_penalties integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  habit_record RECORD;
  category_record RECORD;
  yesterday_date date;
  user_penalties integer;
  total_users integer := 0;
  total_penalty_points integer := 0;
  category_penalties jsonb;
  category_name text;
  penalty_count integer;
BEGIN
  -- Calculate yesterday's date
  yesterday_date := CURRENT_DATE - INTERVAL '1 day';
  
  -- Loop through all users who have habits
  FOR user_record IN 
    SELECT DISTINCT u.id as user_id
    FROM auth.users u
    INNER JOIN habits h ON h.user_id = u.id
  LOOP
    -- Check if we already processed this user for yesterday
    IF EXISTS (
      SELECT 1 FROM daily_penalty_logs 
      WHERE user_id = user_record.user_id 
      AND check_date = yesterday_date
    ) THEN
      CONTINUE; -- Skip this user, already processed
    END IF;
    
    user_penalties := 0;
    category_penalties := '{}'::jsonb;
    
    -- Check all habits for this user
    FOR habit_record IN 
      SELECT * FROM habits 
      WHERE user_id = user_record.user_id
    LOOP
      -- Check if habit was completed yesterday
      IF NOT (habit_record.completed_dates @> to_jsonb(ARRAY[yesterday_date::text])) THEN
        -- Habit was not completed, apply penalty
        category_name := COALESCE(habit_record.category, 'General');
        
        -- Track penalties by category
        IF category_penalties ? category_name THEN
          category_penalties := jsonb_set(
            category_penalties, 
            ARRAY[category_name], 
            to_jsonb((category_penalties->>category_name)::integer + 1)
          );
        ELSE
          category_penalties := jsonb_set(category_penalties, ARRAY[category_name], '1'::jsonb);
        END IF;
        
        user_penalties := user_penalties + 1;
      END IF;
    END LOOP;
    
    -- Apply penalties to categories
    FOR category_name, penalty_count IN 
      SELECT key, value::integer FROM jsonb_each_text(category_penalties)
    LOOP
      -- Find or create the category
      SELECT * INTO category_record 
      FROM categories 
      WHERE user_id = user_record.user_id AND name = category_name;
      
      IF NOT FOUND THEN
        -- Create the category if it doesn't exist
        INSERT INTO categories (user_id, name, color, points)
        VALUES (
          user_record.user_id, 
          category_name, 
          CASE WHEN category_name = 'General' THEN '#6B7280' ELSE '#3B82F6' END,
          0
        );
        
        SELECT * INTO category_record 
        FROM categories 
        WHERE user_id = user_record.user_id AND name = category_name;
      END IF;
      
      -- Apply penalty (subtract points, but don't go below 0)
      UPDATE categories 
      SET points = GREATEST(0, points - penalty_count)
      WHERE id = category_record.id;
    END LOOP;
    
    -- Log the penalty application
    INSERT INTO daily_penalty_logs (user_id, check_date, penalties_applied, message)
    VALUES (
      user_record.user_id,
      yesterday_date,
      user_penalties,
      CASE 
        WHEN user_penalties = 0 THEN 'All quests completed! No penalties applied.'
        WHEN user_penalties = 1 THEN 'Lost 1 point for an uncompleted quest.'
        ELSE 'Lost ' || user_penalties || ' points for uncompleted quests.'
      END
    );
    
    total_users := total_users + 1;
    total_penalty_points := total_penalty_points + user_penalties;
  END LOOP;
  
  RETURN QUERY SELECT total_users, total_penalty_points;
END;
$$;

-- Function to get user's latest penalty message
CREATE OR REPLACE FUNCTION get_user_penalty_message(target_user_id uuid)
RETURNS TABLE(penalty_message text, penalties_applied integer, check_date date)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dpl.message,
    dpl.penalties_applied,
    dpl.check_date
  FROM daily_penalty_logs dpl
  WHERE dpl.user_id = target_user_id
  ORDER BY dpl.check_date DESC
  LIMIT 1;
END;
$$;