/*
  ============================================================================
  ARISE HUNTER - COMPLETE DATABASE SETUP
  ============================================================================
  
  This script creates the complete database schema for the ARISE Hunter System.
  Run this in your Supabase SQL Editor to set up all tables, policies, and functions.
  
  Tables Created:
  1. user_profiles - Extended user profile information
  2. categories - Organization categories for habits/goals
  3. habits - Daily habit tracking
  4. goals - Goal management with milestones
  5. milestones - Goal milestones
  6. skills - Skill learning tracker
  7. rules - Personal rules system
  8. rule_violations - Rule violation tracking
  9. rule_daily_checks - Daily rule compliance checks
  10. routines - Routine management with habit grouping
  
  Security:
  - Row Level Security (RLS) enabled on all tables
  - Policies for authenticated users to manage their own data
  - Automatic user profile creation trigger
  
  ============================================================================
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    unique_id TEXT UNIQUE NOT NULL,
    nickname TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger to user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can manage their own categories"
    ON public.categories
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index for categories
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- ============================================================================
-- HABITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.habits (
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

-- Enable RLS on habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Habits policies
CREATE POLICY "Users can manage their own habits"
    ON public.habits
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index for habits
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);

-- ============================================================================
-- GOALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.goals (
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

-- Enable RLS on goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Goals policies
CREATE POLICY "Users can manage their own goals"
    ON public.goals
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index for goals
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);

-- ============================================================================
-- MILESTONES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    target_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on milestones
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Milestones policies
CREATE POLICY "Users can manage milestones for their own goals"
    ON public.milestones
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.goals
            WHERE goals.id = milestones.goal_id
            AND goals.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.goals
            WHERE goals.id = milestones.goal_id
            AND goals.user_id = auth.uid()
        )
    );

-- Create index for milestones
CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON public.milestones(goal_id);

-- ============================================================================
-- SKILLS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.skills (
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

-- Enable RLS on skills
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Skills policies
CREATE POLICY "Users can manage their own skills"
    ON public.skills
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for skills
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_status ON public.skills(status);

-- ============================================================================
-- RULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rules (
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

-- Enable RLS on rules
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- Rules policies
CREATE POLICY "Users can manage their own rules"
    ON public.rules
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for rules
CREATE INDEX IF NOT EXISTS idx_rules_user_id ON public.rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_is_active ON public.rules(is_active);

-- ============================================================================
-- RULE VIOLATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rule_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES public.rules(id) ON DELETE CASCADE NOT NULL,
    violation_date DATE NOT NULL,
    reason TEXT NOT NULL,
    prevention_plan TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on rule violations
ALTER TABLE public.rule_violations ENABLE ROW LEVEL SECURITY;

-- Rule violations policies
CREATE POLICY "Users can manage violations for their own rules"
    ON public.rule_violations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.rules
            WHERE rules.id = rule_violations.rule_id
            AND rules.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.rules
            WHERE rules.id = rule_violations.rule_id
            AND rules.user_id = auth.uid()
        )
    );

-- Create indexes for rule violations
CREATE INDEX IF NOT EXISTS idx_rule_violations_rule_id ON public.rule_violations(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_violations_date ON public.rule_violations(violation_date);

-- ============================================================================
-- RULE DAILY CHECKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rule_daily_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES public.rules(id) ON DELETE CASCADE NOT NULL,
    check_date DATE NOT NULL,
    respected BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rule_id, check_date)
);

-- Enable RLS on rule daily checks
ALTER TABLE public.rule_daily_checks ENABLE ROW LEVEL SECURITY;

-- Rule daily checks policies
CREATE POLICY "Users can manage daily checks for their own rules"
    ON public.rule_daily_checks
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.rules
            WHERE rules.id = rule_daily_checks.rule_id
            AND rules.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.rules
            WHERE rules.id = rule_daily_checks.rule_id
            AND rules.user_id = auth.uid()
        )
    );

-- Create indexes for rule daily checks
CREATE INDEX IF NOT EXISTS idx_rule_daily_checks_rule_id ON public.rule_daily_checks(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_daily_checks_date ON public.rule_daily_checks(check_date);

-- ============================================================================
-- ROUTINES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    habit_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on routines
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Routines policies
CREATE POLICY "Users can manage their own routines"
    ON public.routines
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index for routines
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON public.routines(user_id);

-- Create trigger to update updated_at timestamp for routines
CREATE TRIGGER update_routines_updated_at
    BEFORE UPDATE ON public.routines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- USER REGISTRATION TRIGGER
-- ============================================================================

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, unique_id, nickname)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, 'user_' || NEW.id::text),
        COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(COALESCE(NEW.email, 'user'), '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Ensure the auth schema trigger can access public schema
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO supabase_auth_admin;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

/*
  Database setup complete! 
  
  Your ARISE Hunter database is now ready with:
  ✓ 10 tables created
  ✓ Row Level Security enabled
  ✓ User policies configured
  ✓ Indexes optimized
  ✓ Auto user profile creation
  
  You can now start using your application!
*/
