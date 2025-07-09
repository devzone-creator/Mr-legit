import React, { useState, useEffect } from 'react'
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements
} from '@stripe/react-stripe-js'
import { stripePromise } from '../lib/stripe'
import LoadingSpinner from './LoadingSpinner'

interface StripeCheckoutFormProps {
  clientSecret: string
  onPaymentSuccess: (paymentIntent: any) => void
  onPaymentError: (error: string) => void
  totalAmount: number
}

const CheckoutForm = ({ clientSecret, onPaymentSuccess, onPaymentError, totalAmount }: StripeCheckoutFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!stripe) return

    if (!clientSecret) return

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!')
          break
        case 'processing':
          setMessage('Your payment is processing.')
          break
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.')
          break
        default:
          setMessage('Something went wrong.')
          break
      }
    })
  }, [stripe, clientSecret])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'An error occurred')
        onPaymentError(error.message || 'An error occurred')
      } else {
        setMessage('An unexpected error occurred.')
        onPaymentError('An unexpected error occurred.')
      }
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment succeeded!')
      onPaymentSuccess(paymentIntent)
    }

    setIsLoading(false)
  }

  const paymentElementOptions = {
    layout: 'tabs' as const,
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            ₵{totalAmount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">Total Amount</div>
        </div>
      </div>

      <PaymentElement id="payment-element" options={paymentElementOptions} />
      
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Processing...
          </>
        ) : (
          `Pay ₵${totalAmount.toFixed(2)}`
        )}
      </button>
      
      {message && (
        <div className={`text-sm text-center ${
          message.includes('succeeded') ? 'text-green-600' : 'text-red-600'
        }`}>
          {message}
        </div>
      )}
    </form>
  )
}

const StripeCheckoutForm = (props: StripeCheckoutFormProps) => {
  const options = {
    clientSecret: props.clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0284c7',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}

export default StripeCheckoutForm