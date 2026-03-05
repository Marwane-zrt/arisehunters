-- ============================================================================
-- ARISE HUNTER - DATABASE PERFORMANCE IMPROVEMENTS
-- Run these in your Supabase SQL Editor to improve query performance.
-- ============================================================================

-- Categories often filtered by user_id
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- Habits are often filtered by category and user_id, ordering by created_at
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_category ON public.habits(category);

-- Goals and Milestones
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_category ON public.goals(category);
CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON public.milestones(goal_id);

-- Skills 
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);

-- Rules
CREATE INDEX IF NOT EXISTS idx_rules_user_id ON public.rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rule_violations_rule_id ON public.rule_violations(rule_id);
CREATE INDEX IF NOT EXISTS idx_rule_daily_checks_rule_id ON public.rule_daily_checks(rule_id);

-- Routines
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON public.routines(user_id);

-- Enhance performance when ordering
CREATE INDEX IF NOT EXISTS idx_habits_created_at ON public.habits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON public.goals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skills_created_at ON public.skills(created_at DESC);
