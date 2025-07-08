import { useState } from 'react'

interface ToastState {
  type: 'success' | 'error' | 'warning'
  message: string
  isVisible: boolean
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    type: 'success',
    message: '',
    isVisible: false
  })

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({
      type,
      message,
      isVisible: true
    })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  return {
    toast,
    showToast,
    hideToast
  }
}