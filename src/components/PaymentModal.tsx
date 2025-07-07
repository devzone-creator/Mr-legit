import React, { useState } from 'react'
import { X, CreditCard, Smartphone } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  onPaymentSuccess: () => void
}

const PaymentModal = ({ isOpen, onClose, totalAmount, onPaymentSuccess }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)

  const formatPrice = (price: number) => {
    return `₵${price.toFixed(2)}`
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

  const handleCardPayment = async () => {
    setLoading(true)
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      onPaymentSuccess()
      onClose()
    }, 2000)
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
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 border rounded-lg flex flex-col items-center space-y-2 ${
                  paymentMethod === 'card'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6 text-blue-500" />
                <span className="text-sm font-medium">Card Payment</span>
              </button>
            </div>
          </div>

          {/* Payment Forms */}
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

          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleCardPayment}
                disabled={!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name || loading}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Pay with Card'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal