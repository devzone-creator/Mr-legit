import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser, isAdmin } from '../lib/auth'
import { supabase } from '../lib/supabase'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminAccess()
    })
    
    return () => subscription.unsubscribe()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const adminStatus = await isAdmin()
      setIsAdmin(adminStatus)
    } catch (error) {
      console.error('Error checking admin access:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">For Development:</h3>
            <p className="text-sm text-blue-700 mb-3">
              To access the admin panel, you need an admin account. 
            </p>
            <ol className="text-sm text-blue-700 text-left space-y-1">
              <li>1. Use email: <code className="bg-blue-100 px-1 rounded">admin@mrlegit.gh</code></li>
              <li>2. Use any password (minimum 6 characters)</li>
              <li>3. Click "Sign In" - the system will create the admin account automatically</li>
            </ol>
          </div>
          
          <Link 
            to="/" 
            className="btn-primary inline-block"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AdminRoute