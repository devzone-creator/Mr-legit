import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  region: string | null
  role: string
}

export const signUp = async (email: string, password: string, fullName: string, phone?: string, address?: string, city?: string, region?: string) => {
  // Check if this is the admin email and auto-assign admin role
  const isAdminEmail = email === 'admin@mrlegit.gh'
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: fullName,
        role: isAdminEmail ? 'admin' : 'customer'
      }
    }
  })
  
  if (error) throw error
  
  // Create profile record if user was created successfully
  if (data.user) {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          phone: phone || null,
          address: address || null,
          city: city || null,
          region: region || null,
          role: isAdminEmail ? 'admin' : 'customer'
        })
      
      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Don't throw here as the user was created successfully in auth
      }
    } catch (profileError) {
      console.error('Error creating profile:', profileError)
    }
  }
  
  return data
}

export const signIn = async (email: string, password: string) => {
  // For admin user, try to create account if it doesn't exist
  if (email === 'admin@mrlegit.gh') {
    try {
      // First try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error && error.message.includes('Invalid login credentials')) {
        // If login fails, try to create the admin account
        console.log('Admin account not found, creating...')
        await signUp(email, password, 'Admin User', '', '', '', '')
        
        // Now try to sign in again
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (signInError) throw signInError
        return signInData
      }
      
      if (error) throw error
      return data
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.')
      } else if (err.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the verification link before signing in.')
      } else {
        throw err
      }
    }
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    // Provide more helpful error messages
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password. Please check your credentials and try again.')
    } else if (error.message.includes('Email not confirmed')) {
      throw new Error('Please check your email and click the verification link before signing in.')
    } else {
      throw error
    }
  }
  
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) return null
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Error fetching profile:', profileError)
      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            role: user.email === 'admin@example.com' ? 'admin' : 'customer'
          })
        
        if (insertError) {
          console.error('Error creating missing profile:', insertError)
          return null
        }
        
        // Fetch the newly created profile
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        return newProfile
      }
      return null
    }
    
    return profile
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

export const updateProfile = async (updates: Partial<User>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No user logged in')
  
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
  
  if (error) throw error
}

// Helper function to check if user is admin
export const isAdmin = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser()
    return user?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}