/*
  # Update user profile creation function

  1. Changes
    - Update the generate_unique_id function to create 8-digit numeric IDs
    - Ensure uniqueness checking still works properly

  2. Security
    - Maintains existing RLS policies
    - Keeps the automatic profile creation trigger
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS generate_unique_id();

-- Create updated function that generates 8-digit numeric IDs
CREATE OR REPLACE FUNCTION generate_unique_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    id_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate 8-digit random number (10000000 to 99999999)
        new_id := (FLOOR(RANDOM() * 90000000) + 10000000)::TEXT;
        
        -- Check if this ID already exists
        SELECT EXISTS(SELECT 1 FROM user_profiles WHERE unique_id = new_id) INTO id_exists;
        
        -- If ID doesn't exist, we can use it
        IF NOT id_exists THEN
            RETURN new_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;