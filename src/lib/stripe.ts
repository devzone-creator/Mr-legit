import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key')
}

// Initialize Stripe
export const stripePromise = loadStripe(stripePublishableKey)

// Stripe API helper functions (via backend)
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    const response = await fetch(`${API_BASE}/api/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Failed to create payment intent')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}