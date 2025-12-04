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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

interface AuthResponse {
  user: {
    id: string
    email: string
    role: string
  }
  token: string
}

const TOKEN_KEY = 'mr_legit_token'

const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  _phone?: string,
  _address?: string,
  _city?: string,
  _region?: string
) => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName }),
        })
      
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to sign up')
  }

  const data: AuthResponse = await res.json()
  saveToken(data.token)
  return data
}

export const signIn = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Invalid email or password. Please check your credentials and try again.')
  }
  
  const data: AuthResponse = await res.json()
  saveToken(data.token)
  return data
}

export const signOut = async () => {
  clearToken()
}

export const getCurrentUser = async (): Promise<User | null> => {
  const token = getToken()
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const user: User = {
      id: payload.id,
      email: payload.email,
      full_name: null,
      phone: null,
      address: null,
      city: null,
      region: null,
      role: payload.role,
      }
    return user
  } catch (error) {
    console.error('Error decoding token:', error)
    clearToken()
    return null
  }
}

export const updateProfile = async (updates: Partial<User>) => {
  console.warn('updateProfile is not implemented for JWT auth yet', updates)
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