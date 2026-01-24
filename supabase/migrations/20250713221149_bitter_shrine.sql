/*
  # Complete Database Rebuild for ARISE Hunter System

  This migration rebuilds the entire database schema from scratch, including:

  1. Utility Functions
     - `generate_8_digit_id()` - Generates unique 8-digit user IDs
     - `update_updated_at_column()` - Updates timestamp triggers
     - `handle_new_user()` - Auto-creates user profiles on signup

  2. Core Tables
     - `user_profiles` - User profile data with unique IDs
     - `categories` - Organization categories for habits/goals
     - `habits` - Daily habit tracking
     - `goals` - Goal setting with milestones
     - `milestones` - Goal milestone tracking
     - `skills` - Skill learning progress
     - `rules` - Personal rules and discipline tracking
     - `rule_daily_checks` - Daily rule compliance tracking
     - `rule_violations` - Rule violation records
     - `friends` - Friend relationships
     - `friend_requests` - Friend request management

  3. Security
     - Row Level Security enabled on all tables
     - Comprehensive RLS policies for data access control
     - User isolation and proper permissions

  4. Automation
     - Automatic user profile creation on signup
     - Timestamp update triggers
     - Proper foreign key relationships
*/

-- Drop all existing tables and functions to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_8_digit_id() CASCADE;

DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS rule_violations CASCADE;
DROP TABLE IF EXISTS rule_daily_checks CASCADE;
DROP TABLE IF EXISTS rules CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create utility functions
CREATE OR REPLACE FUNCTION generate_8_digit_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    id_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 8-digit number
        new_id := LPAD((RANDOM() * 90000000 + 10000000)::INTEGER::TEXT, 8, '0');
        
        -- Check if ID already exists
        SELECT EXISTS(
            SELECT 1 FROM user_profiles WHERE unique_id = new_id
        ) INTO id_exists;
        
        -- Exit loop if ID is unique
        IF NOT id_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    unique_id TEXT UNIQUE NOT NULL DEFAULT generate_8_digit_id(),
    nickname TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own categories"
    ON categories FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Create habits table
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT '',
    color TEXT NOT NULL,
    completed_dates JSONB DEFAULT '[]'::jsonb,
    streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies for habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own habits"
    ON habits FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_habits_user_id ON habits(user_id);

-- Create goals table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT '',
    color TEXT NOT NULL,
    target_date DATE NOT NULL,
    priority TEXT DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT false,
    completed_date TIMESTAMPTZ,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies for goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals"
    ON goals FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_goals_user_id ON goals(user_id);

-- Create milestones table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    target_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies for milestones
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage milestones for their own goals"
    ON milestones FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM goals 
        WHERE goals.id = milestones.goal_id 
        AND goals.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM goals 
        WHERE goals.id = milestones.goal_id 
        AND goals.user_id = auth.uid()
    ));

-- Add index for performance
CREATE INDEX idx_milestones_goal_id ON milestones(goal_id);

-- Create skills table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT '',
    level TEXT DEFAULT 'Beginner',
    status TEXT DEFAULT 'Learning',
    description TEXT DEFAULT '',
    start_date DATE NOT NULL,
    completed_date TIMESTAMPTZ,
    resources JSONB DEFAULT '[]'::jsonb,
    progress INTEGER DEFAULT 0,
    color TEXT NOT NULL,
    total_learning_time INTEGER DEFAULT 0,
    is_timer_active BOOLEAN DEFAULT false,
    last_timer_start TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies for skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own skills"
    ON skills FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_status ON skills(status);

-- Create rules table
CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    color TEXT NOT NULL,
    category TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    total_days_checked INTEGER DEFAULT 0,
    days_respected INTEGER DEFAULT 0,
    days_violated INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies for rules
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own rules"
    ON rules FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_rules_user_id ON rules(user_id);
CREATE INDEX idx_rules_is_active ON rules(is_active);

-- Create rule_daily_checks table
CREATE TABLE rule_daily_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES rules(id) ON DELETE CASCADE NOT NULL,
    check_date DATE NOT NULL,
    respected BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rule_id, check_date)
);

-- Enable RLS and create policies for rule_daily_checks
ALTER TABLE rule_daily_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage daily checks for their own rules"
    ON rule_daily_checks FOR ALL
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

-- Add indexes for performance
CREATE INDEX idx_rule_daily_checks_rule_id ON rule_daily_checks(rule_id);
CREATE INDEX idx_rule_daily_checks_date ON rule_daily_checks(check_date);

-- Create rule_violations table
CREATE TABLE rule_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES rules(id) ON DELETE CASCADE NOT NULL,
    violation_date DATE NOT NULL,
    reason TEXT NOT NULL,
    prevention_plan TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies for rule_violations
ALTER TABLE rule_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage violations for their own rules"
    ON rule_violations FOR ALL
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

-- Add indexes for performance
CREATE INDEX idx_rule_violations_rule_id ON rule_violations(rule_id);
CREATE INDEX idx_rule_violations_date ON rule_violations(violation_date);

-- Create friends table
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
    friend_user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'accepted',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_user_id)
);

-- Enable RLS and create policies for friends
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
    ON friends FOR SELECT
    TO authenticated
    USING (
        user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid()) OR
        friend_user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid())
    );

CREATE POLICY "Users can create their own friendships"
    ON friends FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid()));

CREATE POLICY "Users can update their own friendships"
    ON friends FOR UPDATE
    TO authenticated
    USING (
        user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid()) OR
        friend_user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid())
    );

CREATE POLICY "Users can delete their own friendships"
    ON friends FOR DELETE
    TO authenticated
    USING (
        user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid()) OR
        friend_user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid())
    );

-- Add indexes for performance
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_user_id ON friends(friend_user_id);
CREATE INDEX idx_friends_status ON friends(status);

-- Create friend_requests table
CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
    to_user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_user_id, to_user_id)
);

-- Enable RLS and create policies for friend_requests
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend requests"
    ON friend_requests FOR SELECT
    TO authenticated
    USING (
        from_user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid()) OR
        to_user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid())
    );

CREATE POLICY "Users can create friend requests"
    ON friend_requests FOR INSERT
    TO authenticated
    WITH CHECK (from_user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid()));

CREATE POLICY "Users can update friend requests they received"
    ON friend_requests FOR UPDATE
    TO authenticated
    USING (to_user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid()));

CREATE POLICY "Users can delete their own friend requests"
    ON friend_requests FOR DELETE
    TO authenticated
    USING (
        from_user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid()) OR
        to_user_id = (SELECT user_profiles.user_id FROM user_profiles WHERE user_profiles.user_id = auth.uid())
    );

-- Add indexes for performance
CREATE INDEX idx_friend_requests_from_user_id ON friend_requests(from_user_id);
CREATE INDEX idx_friend_requests_to_user_id ON friend_requests(to_user_id);
CREATE INDEX idx_friend_requests_status ON friend_requests(status);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, unique_id)
    VALUES (NEW.id, generate_8_digit_id());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();