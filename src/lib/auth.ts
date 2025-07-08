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

export const signUp = async (email: string, password: string, fullName: string) => {
  // Check if this is the admin email and auto-assign admin role
  const isAdminEmail = email === 'admin@example.com'
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: isAdminEmail ? 'admin' : 'customer'
      }
    }
  })
  
  if (error) throw error
  
  // If this is the admin email, update the profile role after creation
  if (isAdminEmail && data.user) {
    try {
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', data.user.id)
    } catch (updateError) {
      console.error('Error setting admin role:', updateError)
    }
  }
  
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
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