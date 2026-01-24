/*
  # Create rules and related tables

  1. New Tables
    - `rules`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text, required)
      - `description` (text, optional)
      - `color` (text, required)
      - `category` (text, optional)
      - `is_active` (boolean, default true)
      - `total_days_checked` (integer, default 0)
      - `days_respected` (integer, default 0)
      - `days_violated` (integer, default 0)
      - `current_streak` (integer, default 0)
      - `best_streak` (integer, default 0)
      - `created_at` (timestamp)
    
    - `rule_violations`
      - `id` (uuid, primary key)
      - `rule_id` (uuid, foreign key to rules)
      - `violation_date` (date, required)
      - `reason` (text, required)
      - `prevention_plan` (text, required)
      - `created_at` (timestamp)
    
    - `rule_daily_checks`
      - `id` (uuid, primary key)
      - `rule_id` (uuid, foreign key to rules)
      - `check_date` (date, required)
      - `respected` (boolean, required)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Add indexes for performance optimization
    - Add unique constraint for rule_daily_checks to prevent duplicates
*/

-- Create rules table
CREATE TABLE IF NOT EXISTS rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  color text NOT NULL,
  category text DEFAULT '',
  is_active boolean DEFAULT true,
  total_days_checked integer DEFAULT 0,
  days_respected integer DEFAULT 0,
  days_violated integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create rule_violations table
CREATE TABLE IF NOT EXISTS rule_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  violation_date date NOT NULL,
  reason text NOT NULL,
  prevention_plan text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create rule_daily_checks table
CREATE TABLE IF NOT EXISTS rule_daily_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  check_date date NOT NULL,
  respected boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(rule_id, check_date)
);

-- Enable RLS
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_daily_checks ENABLE ROW LEVEL SECURITY;

-- Create policies for rules
CREATE POLICY "Users can manage their own rules"
  ON rules
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for rule_violations
CREATE POLICY "Users can manage violations for their own rules"
  ON rule_violations
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM rules 
    WHERE rules.id = rule_violations.rule_id 
    AND rules.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM rules 
    WHERE rules.id = rule_violations.rule_id 
    AND rules.user_id = auth.uid()
  ));

-- Create policies for rule_daily_checks
CREATE POLICY "Users can manage daily checks for their own rules"
  ON rule_daily_checks
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM rules 
    WHERE rules.id = rule_daily_checks.rule_id 
    AND rules.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM rules 
    WHERE rules.id = rule_daily_checks.rule_id 
    AND rules.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rules_user_id ON rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_is_active ON rules(is_active);
CREATE INDEX IF NOT EXISTS idx_rule_violations_rule_id ON rule_violations(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_violations_date ON rule_violations(violation_date);
CREATE INDEX IF NOT EXISTS idx_rule_daily_checks_rule_id ON rule_daily_checks(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_daily_checks_date ON rule_daily_checks(check_date);