/*
  # Update Skills Table - Remove Timer Features and Add Goal Linking

  1. Changes Made
    - Remove timer-related columns (total_learning_time, is_timer_active, last_timer_start)
    - Add linked_goal_id column to link skills with goals
    - Update existing skills to have null linked_goal_id

  2. Security
    - Maintain existing RLS policies
    - No changes to permissions needed
*/

-- Remove timer-related columns from skills table
DO $$
BEGIN
  -- Remove total_learning_time column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skills' AND column_name = 'total_learning_time'
  ) THEN
    ALTER TABLE skills DROP COLUMN total_learning_time;
  END IF;

  -- Remove is_timer_active column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skills' AND column_name = 'is_timer_active'
  ) THEN
    ALTER TABLE skills DROP COLUMN is_timer_active;
  END IF;

  -- Remove last_timer_start column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skills' AND column_name = 'last_timer_start'
  ) THEN
    ALTER TABLE skills DROP COLUMN last_timer_start;
  END IF;
END $$;

-- Add linked_goal_id column to link skills with goals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skills' AND column_name = 'linked_goal_id'
  ) THEN
    ALTER TABLE skills ADD COLUMN linked_goal_id uuid REFERENCES goals(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better performance on goal lookups
CREATE INDEX IF NOT EXISTS idx_skills_linked_goal_id ON skills(linked_goal_id);