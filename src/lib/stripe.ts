import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key')
}

if (!stripeSecretKey) {
  throw new Error('Missing Stripe secret key')
}

// Initialize Stripe
export const stripePromise = loadStripe(stripePublishableKey)

// Stripe API helper functions
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(), // Convert to cents
        currency: currency,
        automatic_payment_methods: JSON.stringify({
          enabled: true,
        }),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create payment intent')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

export const confirmPayment = async (paymentIntentId: string) => {
  try {
    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to confirm payment')
    }

    return await response.json()
  } catch (error) {
    console.error('Error confirming payment:', error)
    throw error
  }
}

export const createCustomer = async (email: string, name?: string) => {
  try {
    const response = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: email,
        ...(name && { name: name }),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create customer')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}