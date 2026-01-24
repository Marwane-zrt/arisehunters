/*
  # Add 8-digit user ID system

  1. Changes
    - Add function to generate random 8-digit IDs
    - Update user_profiles table to use 8-digit IDs
    - Ensure all existing users get 8-digit IDs
    - Update trigger to generate IDs for new users

  2. Security
    - Maintain existing RLS policies
*/

-- Function to generate random 8-digit ID
CREATE OR REPLACE FUNCTION generate_8_digit_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    id_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 8-digit number (10000000 to 99999999)
        new_id := LPAD((FLOOR(RANDOM() * 90000000) + 10000000)::TEXT, 8, '0');
        
        -- Check if this ID already exists
        SELECT EXISTS(SELECT 1 FROM user_profiles WHERE unique_id = new_id) INTO id_exists;
        
        -- If ID doesn't exist, we can use it
        IF NOT id_exists THEN
            RETURN new_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing users who don't have 8-digit IDs
DO $$
DECLARE
    user_record RECORD;
    new_8_digit_id TEXT;
BEGIN
    FOR user_record IN 
        SELECT id, unique_id 
        FROM user_profiles 
        WHERE LENGTH(unique_id) != 8 OR unique_id !~ '^[0-9]{8}$'
    LOOP
        new_8_digit_id := generate_8_digit_id();
        
        UPDATE user_profiles 
        SET unique_id = new_8_digit_id,
            updated_at = now()
        WHERE id = user_record.id;
    END LOOP;
END $$;

-- Update the trigger function to use 8-digit IDs for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, unique_id)
    VALUES (NEW.id, generate_8_digit_id());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;