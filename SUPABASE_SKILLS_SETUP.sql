-- ============================================================================
-- FINAL REPAIR SCRIPT FOR SKILLS TABLE
-- Run this in your Supabase SQL Editor.
-- This script ensures the table exists, has all columns, and correct permissions.
-- ============================================================================

-- 1. Create the table if it doesn't exist
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure the linked_goal_id column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'skills' 
        AND column_name = 'linked_goal_id'
    ) THEN
        ALTER TABLE public.skills ADD COLUMN linked_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- 4. Set up Policies (Delete and Recreate)
DROP POLICY IF EXISTS "Users can manage their own skills" ON public.skills;
CREATE POLICY "Users can manage their own skills"
    ON public.skills
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Create Indexes
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON public.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_status ON public.skills(status);
CREATE INDEX IF NOT EXISTS idx_skills_linked_goal_id ON public.skills(linked_goal_id);

-- 6. Important: Force refresh of the cache
NOTIFY pgrst, 'reload schema';
