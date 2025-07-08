/*
  # Fix authentication database setup

  This migration creates the necessary trigger function and trigger to automatically
  create user profiles when new users sign up through Supabase Auth.

  1. Trigger Function
    - `handle_new_user()` - Creates a profile record when a new user signs up
    
  2. Trigger
    - Automatically calls the function on user creation
    
  3. Security
    - Ensures proper profile creation for all new users
    - Maintains data consistency between auth.users and public.profiles
*/

-- Create the trigger function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'customer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that calls the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();