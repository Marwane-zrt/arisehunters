/*
  # Update penalty logic with General category fallback

  1. Database Functions
    - Update `apply_daily_penalties_for_all_users_v2` function to implement new penalty logic
    - If a category has 0 points, try to apply penalty to General category
    - If General category also has 0 points, skip the penalty entirely

  2. Logic Flow
    - Check if habit's category has points > 0
    - If yes, apply penalty to that category
    - If no, find General category and check if it has points > 0
    - If General has points, apply penalty there
    - If General also has 0 points, skip penalty (no deduction)

  3. Logging
    - Enhanced logging to track when penalties are skipped due to insufficient points
    - Clear messages about which category received the penalty or why it was skipped
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS apply_daily_penalties_for_all_users_v2();

-- Create the updated function with new penalty logic
CREATE OR REPLACE FUNCTION apply_daily_penalties_for_all_users_v2()
RETURNS TABLE(users_processed INTEGER, total_penalties INTEGER) AS $$
DECLARE
  user_record RECORD;
  habit_record RECORD;
  category_record RECORD;
  general_category_record RECORD;
  yesterday_date DATE;
  user_penalties INTEGER;
  total_penalty_count INTEGER := 0;
  processed_users INTEGER := 0;
  penalty_message TEXT;
  category_id_to_penalize UUID;
  penalty_applied BOOLEAN;
BEGIN
  -- Calculate yesterday's date
  yesterday_date := CURRENT_DATE - INTERVAL '1 day';
  
  -- Log the start of penalty application
  RAISE NOTICE 'Starting penalty application for date: %', yesterday_date;
  
  -- Loop through all users who have habits
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM habits 
  LOOP
    user_penalties := 0;
    penalty_message := '';
    
    -- Check if we already processed this user for yesterday
    IF EXISTS (
      SELECT 1 FROM daily_penalty_logs 
      WHERE user_id = user_record.user_id 
      AND check_date = yesterday_date
    ) THEN
      RAISE NOTICE 'User % already processed for %', user_record.user_id, yesterday_date;
      CONTINUE;
    END IF;
    
    -- Loop through all habits for this user
    FOR habit_record IN 
      SELECT * FROM habits 
      WHERE user_id = user_record.user_id 
    LOOP
      -- Check if habit was completed yesterday
      IF NOT (habit_record.completed_dates ? yesterday_date::text) THEN
        penalty_applied := FALSE;
        category_id_to_penalize := NULL;
        
        -- Find the category for this habit
        SELECT * INTO category_record 
        FROM categories 
        WHERE user_id = user_record.user_id 
        AND name = COALESCE(habit_record.category, 'General');
        
        -- If category exists and has points > 0, apply penalty there
        IF category_record.id IS NOT NULL AND category_record.points > 0 THEN
          category_id_to_penalize := category_record.id;
          penalty_applied := TRUE;
          RAISE NOTICE 'Applying penalty to category: % (% points)', category_record.name, category_record.points;
        ELSE
          -- Category has 0 points or doesn't exist, try General category
          SELECT * INTO general_category_record 
          FROM categories 
          WHERE user_id = user_record.user_id 
          AND name = 'General';
          
          -- If General category exists and has points > 0, apply penalty there
          IF general_category_record.id IS NOT NULL AND general_category_record.points > 0 THEN
            category_id_to_penalize := general_category_record.id;
            penalty_applied := TRUE;
            RAISE NOTICE 'Applying penalty to General category instead (% points)', general_category_record.points;
          ELSE
            -- General category also has 0 points or doesn't exist, skip penalty
            penalty_applied := FALSE;
            RAISE NOTICE 'Skipping penalty for habit % - no category with available points', habit_record.name;
          END IF;
        END IF;
        
        -- Apply the penalty if we found a valid category
        IF penalty_applied AND category_id_to_penalize IS NOT NULL THEN
          UPDATE categories 
          SET points = GREATEST(0, points - 1)
          WHERE id = category_id_to_penalize;
          
          user_penalties := user_penalties + 1;
          total_penalty_count := total_penalty_count + 1;
          
          -- Add to penalty message
          IF penalty_message = '' THEN
            penalty_message := 'Lost points for uncompleted quests: ';
          ELSE
            penalty_message := penalty_message || ', ';
          END IF;
          penalty_message := penalty_message || habit_record.name;
        END IF;
      END IF;
    END LOOP;
    
    -- Create penalty log entry for this user
    INSERT INTO daily_penalty_logs (user_id, check_date, penalties_applied, message)
    VALUES (
      user_record.user_id, 
      yesterday_date, 
      user_penalties,
      CASE 
        WHEN user_penalties = 0 THEN 'All quests completed or no penalties applied due to insufficient category points'
        ELSE penalty_message
      END
    )
    ON CONFLICT (user_id, check_date) 
    DO UPDATE SET 
      penalties_applied = EXCLUDED.penalties_applied,
      message = EXCLUDED.message;
    
    processed_users := processed_users + 1;
    RAISE NOTICE 'Processed user %, applied % penalties', user_record.user_id, user_penalties;
  END LOOP;
  
  RAISE NOTICE 'Penalty application complete. Processed % users, applied % total penalties', processed_users, total_penalty_count;
  
  RETURN QUERY SELECT processed_users, total_penalty_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;