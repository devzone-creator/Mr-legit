import React, { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error' | 'warning'
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const Toast = ({ type, message, isVisible, onClose, duration = 5000 }: ToastProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200'
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className={`flex items-center p-4 border rounded-lg shadow-lg ${bgColors[type]} max-w-sm`}>
        {icons[type]}
        <p className="ml-3 text-sm font-medium text-gray-900 flex-1">{message}</p>
        <button
          onClick={onClose}
          className="ml-3 p-1 hover:bg-gray-200 rounded-full"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  )
}

export default Toast