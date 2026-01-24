/*
  # Add skills table to ARISE Hunter System

  1. New Tables
    - `skills`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `category` (text)
      - `level` (text)
      - `status` (text)
      - `description` (text)
      - `start_date` (date)
      - `completed_date` (timestamp)
      - `resources` (jsonb array)
      - `progress` (integer, default 0)
      - `color` (text)
      - `total_learning_time` (integer, default 0)
      - `is_timer_active` (boolean, default false)
      - `last_timer_start` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on skills table
    - Add policy for authenticated users to manage their own skills
*/

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text DEFAULT '',
  level text DEFAULT 'Beginner',
  status text DEFAULT 'Learning',
  description text DEFAULT '',
  start_date date NOT NULL,
  completed_date timestamptz,
  resources jsonb DEFAULT '[]'::jsonb,
  progress integer DEFAULT 0,
  color text NOT NULL,
  total_learning_time integer DEFAULT 0,
  is_timer_active boolean DEFAULT false,
  last_timer_start timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own skills"
  ON skills
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_status ON skills(status);