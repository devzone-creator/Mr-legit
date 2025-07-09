import React, { useState } from 'react'
import { X, CreditCard, Smartphone } from 'lucide-react'
import { createPaymentIntent } from '../lib/stripe'
import StripeCheckoutForm from './StripeCheckoutForm'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  onPaymentSuccess: () => void
}

const PaymentModal = ({ isOpen, onClose, totalAmount, onPaymentSuccess }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'momo'>('stripe')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [showStripeForm, setShowStripeForm] = useState(false)

  const formatPrice = (price: number) => {
    return `₵${price.toFixed(2)}`
  }

  const handleStripePayment = async () => {
    setLoading(true)
    try {
      const paymentIntent = await createPaymentIntent(totalAmount, 'usd')
      setClientSecret(paymentIntent.client_secret)
      setShowStripeForm(true)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      alert('Error setting up payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMomoPayment = async () => {
    setLoading(true)
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      onPaymentSuccess()
      onClose()
    }, 2000)
  }

  const handleStripePaymentSuccess = (paymentIntent: any) => {
    onPaymentSuccess()
    onClose()
  }

  const handleStripePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(totalAmount)}
              </div>
              <div className="text-sm text-gray-500">Total Amount</div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`p-3 border rounded-lg flex flex-col items-center space-y-2 ${
                  paymentMethod === 'stripe'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6 text-blue-500" />
                <span className="text-sm font-medium">Card Payment</span>
              </button>
              <button
                onClick={() => setPaymentMethod('momo')}
                className={`p-3 border rounded-lg flex flex-col items-center space-y-2 ${
                  paymentMethod === 'momo'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-6 h-6 text-orange-500" />
                <span className="text-sm font-medium">Mobile Money</span>
              </button>
            </div>
          </div>

          {/* Payment Forms */}
          {showStripeForm && clientSecret ? (
            <div className="space-y-4">
              <button
                onClick={() => setShowStripeForm(false)}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                ← Back to payment methods
              </button>
              <StripeCheckoutForm
                clientSecret={clientSecret}
                onPaymentSuccess={handleStripePaymentSuccess}
                onPaymentError={handleStripePaymentError}
                totalAmount={totalAmount}
              />
            </div>
          ) : (
            <>
          {paymentMethod === 'stripe' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">Secure Card Payment</p>
                <p>Your payment will be processed securely through Stripe. We accept all major credit and debit cards.</p>
              </div>
              <button
                onClick={handleStripePayment}
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Setting up payment...' : 'Continue to Card Payment'}
              </button>
            </div>
          )}

          {paymentMethod === 'momo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0XX XXX XXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="text-xs text-gray-500">
                You will receive a prompt on your phone to complete the payment
              </div>
              <button
                onClick={handleMomoPayment}
                disabled={!phoneNumber || loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Pay with Mobile Money'}
              </button>
            </div>
          )}

            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal