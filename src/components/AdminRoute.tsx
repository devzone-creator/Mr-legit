import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../lib/auth'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const user = await getCurrentUser()
      setIsAdmin(user?.role === 'admin')
    } catch (error) {
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
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
              <li>1. Sign up with email: <code className="bg-blue-100 px-1 rounded">admin@example.com</code></li>
              <li>2. Use any password (minimum 6 characters)</li>
              <li>3. The system will automatically make this user an admin</li>
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