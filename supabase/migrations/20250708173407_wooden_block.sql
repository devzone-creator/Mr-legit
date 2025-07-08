/*
  # Create Admin User

  1. Create a default admin user for development
  2. This user can access the admin dashboard
  
  Note: In production, you should create admin users through a secure process
*/

-- Insert a default admin user (you can change these credentials)
-- This will only work if you sign up with this exact email first
DO $$
BEGIN
  -- Update any existing user with this email to be admin
  UPDATE profiles 
  SET role = 'admin' 
  WHERE email = 'admin@mrlegit.gh';
  
  -- If no user exists with this email, we'll create a placeholder
  -- You'll need to actually sign up with this email through the UI first
  IF NOT FOUND THEN
    -- This is just a placeholder - the actual user creation happens through Supabase Auth
    RAISE NOTICE 'No user found with email admin@mrlegit.gh. Please sign up with this email first, then run this migration again.';
  END IF;
END $$;

-- Alternative: Update any existing user to admin (for development only)
-- Uncomment the line below to make the first user in your system an admin
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM profiles ORDER BY created_at LIMIT 1);