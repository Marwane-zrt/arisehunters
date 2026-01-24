/*
  # Update penalty logic for zero-point categories

  1. Database Functions
    - Updates `apply_daily_penalties_for_all_users_v2` function
    - Implements fallback logic: if habit category has 0 points, try General category
    - If General category also has 0 points, skip penalty entirely
    - Improved logging to track penalty applications and skips

  2. Logic Flow
    - Check habit's category points first
    - If > 0: apply penalty to habit's category
    - If = 0: check General category points
    - If General > 0: apply penalty to General category
    - If General = 0: skip penalty entirely and log the skip

  3. Logging
    - Records all penalty applications with detailed messages
    - Tracks which category received the penalty
    - Logs when penalties are skipped due to zero points
*/

CREATE OR REPLACE FUNCTION public.apply_daily_penalties_for_all_users_v2()
RETURNS TABLE(users_processed integer, total_penalties integer)
LANGUAGE plpgsql
AS $$
DECLARE
    r record;
    h record;
    _users_processed integer := 0;
    _total_penalties integer := 0;
    _today date := current_date;
    _yesterday date := current_date - interval '1 day';
    _general_category_id uuid;
    _general_category_points integer;
    _habit_category_id uuid;
    _habit_category_points integer;
    _category_name text;
    _penalty_message text;
BEGIN
    -- Process each user with habits
    FOR r IN
        SELECT DISTINCT user_id FROM public.habits
    LOOP
        _users_processed := _users_processed + 1;
        
        -- Get or create the 'General' category for the current user
        SELECT id, points INTO _general_category_id, _general_category_points
        FROM public.categories
        WHERE user_id = r.user_id AND name = 'General';

        IF _general_category_id IS NULL THEN
            INSERT INTO public.categories (user_id, name, color, points)
            VALUES (r.user_id, 'General', '#6B7280', 0)
            RETURNING id, points INTO _general_category_id, _general_category_points;
        END IF;

        -- Find habits not completed yesterday for the current user
        FOR h IN
            SELECT id, category FROM public.habits
            WHERE user_id = r.user_id
            AND NOT (completed_dates @> to_jsonb(ARRAY[_yesterday::text]))
        LOOP
            _habit_category_id := NULL;
            _habit_category_points := 0;
            _category_name := COALESCE(h.category, 'General');
            
            -- Get the category for the current habit
            IF _category_name != '' THEN
                SELECT id, points INTO _habit_category_id, _habit_category_points
                FROM public.categories
                WHERE user_id = r.user_id AND name = _category_name;
            END IF;

            -- If habit category doesn't exist, default to 'General'
            IF _habit_category_id IS NULL THEN
                _habit_category_id := _general_category_id;
                _habit_category_points := _general_category_points;
                _category_name := 'General';
            END IF;

            -- Apply penalty logic based on your requirements
            IF _habit_category_points > 0 THEN
                -- Apply penalty to habit's category
                UPDATE public.categories
                SET points = GREATEST(0, points - 1)
                WHERE id = _habit_category_id;
                
                _total_penalties := _total_penalties + 1;
                _penalty_message := 'Penalty applied to ' || _category_name || ' category for uncompleted habit';
                
            ELSIF _general_category_points > 0 AND _habit_category_id != _general_category_id THEN
                -- Apply penalty to 'General' category if habit's category has 0 points
                UPDATE public.categories
                SET points = GREATEST(0, points - 1)
                WHERE id = _general_category_id;
                
                _total_penalties := _total_penalties + 1;
                _penalty_message := 'Penalty applied to General category (fallback) for uncompleted habit from ' || _category_name || ' category';
                
            ELSE
                -- No penalty applied - both categories have 0 points
                _penalty_message := 'No penalty applied for uncompleted habit from ' || _category_name || ' category (both category and General have 0 points)';
            END IF;

            -- Log the penalty decision
            INSERT INTO public.daily_penalty_logs (user_id, check_date, penalties_applied, message)
            VALUES (
                r.user_id, 
                _yesterday, 
                CASE WHEN _penalty_message LIKE 'Penalty applied%' THEN 1 ELSE 0 END,
                _penalty_message
            )
            ON CONFLICT (user_id, check_date) 
            DO UPDATE SET 
                penalties_applied = daily_penalty_logs.penalties_applied + EXCLUDED.penalties_applied,
                message = daily_penalty_logs.message || '; ' || EXCLUDED.message;

            -- Refresh General category points for next iteration
            SELECT points INTO _general_category_points
            FROM public.categories
            WHERE id = _general_category_id;
        END LOOP;
    END LOOP;

    RETURN QUERY SELECT _users_processed, _total_penalties;
END;
$$;