/*
  # Create routines table

  1. New Tables
    - `routines`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, not null)
      - `description` (text, optional)
      - `color` (text, not null)
      - `habit_ids` (jsonb array of habit IDs)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `routines` table
    - Add policy for users to manage their own routines
*/

CREATE TABLE IF NOT EXISTS routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text NOT NULL,
  habit_ids jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own routines"
  ON routines
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_routines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW
  EXECUTE FUNCTION update_routines_updated_at();