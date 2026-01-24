/*
  # Add INSERT policy for daily_penalty_logs table

  1. Security
    - Add policy for authenticated users to insert their own penalty logs
    - Users can only insert records where user_id matches their auth.uid()

  This fixes the RLS violation error when the quest penalty system tries to log penalty applications.
*/

CREATE POLICY "Users can insert their own penalty logs"
  ON daily_penalty_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);