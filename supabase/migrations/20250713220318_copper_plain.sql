/*
  # Add generate_8_digit_id RPC function

  1. New Functions
    - `generate_8_digit_id()` - Generates a unique 8-digit numeric ID for user profiles
  
  2. Purpose
    - Resolves the "Database error saving new user" issue during signup
    - Ensures unique 8-digit IDs are generated for user profiles
    - Prevents conflicts with existing IDs in the user_profiles table
*/

CREATE OR REPLACE FUNCTION generate_8_digit_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-digit number (10000000 to 99999999)
    new_id := LPAD((FLOOR(RANDOM() * 90000000) + 10000000)::TEXT, 8, '0');
    
    -- Check if this ID already exists in user_profiles table
    SELECT EXISTS(
      SELECT 1 FROM user_profiles WHERE unique_id = new_id
    ) INTO id_exists;
    
    -- If ID doesn't exist, we can use it
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$;