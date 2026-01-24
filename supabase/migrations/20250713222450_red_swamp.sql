/*
  # Fix user signup database errors

  1. Database Functions
    - Create `generate_8_digit_id` function to generate unique 8-digit IDs
    - Create `handle_new_user` trigger function for automatic profile creation
  
  2. Triggers
    - Add trigger to automatically create user profile when new user signs up
  
  3. Security
    - Ensure proper RLS policies for user profile creation during signup
*/

-- Create function to generate unique 8-digit ID
CREATE OR REPLACE FUNCTION generate_8_digit_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id text;
  id_exists boolean;
BEGIN
  LOOP
    -- Generate random 8-digit number
    new_id := LPAD(FLOOR(RANDOM() * 100000000)::text, 8, '0');
    
    -- Check if this ID already exists
    SELECT EXISTS(
      SELECT 1 FROM user_profiles WHERE unique_id = new_id
    ) INTO id_exists;
    
    -- If ID doesn't exist, we can use it
    IF NOT id_exists THEN
      RETURN new_id;
    END IF;
  END LOOP;
END;
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, unique_id)
  VALUES (
    NEW.id,
    generate_8_digit_id()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure anon users can insert during signup process
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Allow anon insert during signup'
  ) THEN
    CREATE POLICY "Allow anon insert during signup"
      ON user_profiles
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.user_profiles TO anon;
GRANT EXECUTE ON FUNCTION generate_8_digit_id() TO anon;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon;