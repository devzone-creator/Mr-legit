export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^0[0-9]{9}$/
  return phoneRegex.test(phone)
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' }
  }
  return { isValid: true }
}

export const validateRequired = (value: string, fieldName: string): { isValid: boolean; message?: string } => {
  if (!value.trim()) {
    return { isValid: false, message: `${fieldName} is required` }
  }
  return { isValid: true }
}

export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined) {
    return '₵0.00'
  }
  return `₵${price.toFixed(2)}`
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}