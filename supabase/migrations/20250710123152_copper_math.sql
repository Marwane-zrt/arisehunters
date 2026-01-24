/*
  # Create user data schema for ARISE Hunter System

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `color` (text)
      - `points` (integer, default 0)
      - `created_at` (timestamp)
    - `habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `category` (text)
      - `color` (text)
      - `completed_dates` (jsonb array)
      - `streak` (integer, default 0)
      - `best_streak` (integer, default 0)
      - `created_at` (timestamp)
    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `category` (text)
      - `color` (text)
      - `target_date` (date)
      - `priority` (text)
      - `is_completed` (boolean, default false)
      - `completed_date` (timestamp)
      - `progress` (integer, default 0)
      - `created_at` (timestamp)
    - `milestones`
      - `id` (uuid, primary key)
      - `goal_id` (uuid, foreign key to goals)
      - `title` (text)
      - `target_date` (date)
      - `is_completed` (boolean, default false)
      - `completed_date` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text DEFAULT '',
  color text NOT NULL,
  completed_dates jsonb DEFAULT '[]'::jsonb,
  streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own habits"
  ON habits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text DEFAULT '',
  color text NOT NULL,
  target_date date NOT NULL,
  priority text DEFAULT 'medium',
  is_completed boolean DEFAULT false,
  completed_date timestamptz,
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals"
  ON goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_date date NOT NULL,
  is_completed boolean DEFAULT false,
  completed_date timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage milestones for their own goals"
  ON milestones
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = milestones.goal_id 
      AND goals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = milestones.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON milestones(goal_id);