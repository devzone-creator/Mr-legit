/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - The "Admins can read all profiles" policy causes infinite recursion
    - It queries the profiles table within its own policy definition
    - This creates a circular dependency during policy evaluation

  2. Solution
    - Drop the problematic admin policy that causes recursion
    - Create a simpler policy structure that avoids self-referencing
    - Use auth.uid() directly without querying profiles table in policies
    - Add a separate function to check admin status if needed

  3. Changes
    - Remove recursive admin policies
    - Keep simple user-based policies that don't cause recursion
    - Ensure users can still read and update their own profiles
*/

-- Drop all existing policies for profiles table
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create non-recursive policies
-- Users can read their own profile (no recursion)
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (no recursion)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile (for new user registration)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create a function to safely check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Admin policy using the function (this avoids recursion by using SECURITY DEFINER)
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin policy for updates
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin());