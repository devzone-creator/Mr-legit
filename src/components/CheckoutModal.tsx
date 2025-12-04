import React, { useState, useEffect } from 'react'
import { X, MapPin, Phone, CreditCard, Smartphone } from 'lucide-react'
import { getCurrentUser, getToken, User } from '../lib/auth'
import { createPaymentIntent, createCustomer } from '../lib/stripe'
import StripeCheckoutForm from './StripeCheckoutForm'

interface CartItem {
  id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  onOrderSuccess: () => void
}

const CheckoutModal = ({ isOpen, onClose, cartItems, onOrderSuccess }: CheckoutModalProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'momo'>('stripe')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryRegion, setDeliveryRegion] = useState<'Northern' | 'Upper East' | 'Upper West' | 'North East' | 'Savannah'>('Northern')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment'>('details')

  useEffect(() => {
    if (isOpen) {
      loadUser()
    }
  }, [isOpen])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      if (currentUser?.phone) {
        setPhoneNumber(currentUser.phone)
      }
      if (currentUser?.address) {
        setDeliveryAddress(currentUser.address)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const formatPrice = (price: number) => {
    return `₵${price.toFixed(2)}`
  }

  const handleProceedToPayment = async () => {
    if (!user) return

    setLoading(true)
    try {
      const totalAmount = getTotalAmount()
      
      if (paymentMethod === 'stripe') {
        // Create payment intent with Stripe
        const paymentIntent = await createPaymentIntent(totalAmount, 'usd')
        setClientSecret(paymentIntent.client_secret)
        setPaymentStep('payment')
      } else {
        // Handle mobile money payment
        await handleMomoPayment()
      }
    } catch (error) {
      console.error('Error setting up payment:', error)
      alert('Error setting up payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMomoPayment = async () => {
    // Simulate mobile money payment
    await new Promise(resolve => setTimeout(resolve, 2000))
    await completeOrder('momo', `MOMO_${Date.now()}`)
  }

  const handleStripePaymentSuccess = async (paymentIntent: any) => {
    await completeOrder('stripe', paymentIntent.id)
  }

  const handleStripePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`)
  }

  const completeOrder = async (method: string, paymentReference: string) => {
    if (!user) return

    try {
      const token = getToken()
      if (!token) {
        alert('You need to be signed in to place an order.')
        return
      }

      const items = cartItems.map(item => ({
        productId: Number(item.id),
        quantity: item.quantity,
        unitPrice: item.price,
      }))

      if (!phoneNumber || !deliveryAddress || !deliveryRegion) {
        alert('Please fill in all delivery information (phone, address, and region)')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          total: getTotalAmount(),
          paymentMethod: method,
          paymentReference,
          phoneNumber,
          deliveryAddress,
          deliveryRegion,
          deliveryNotes: deliveryNotes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to place order')
      }

      onOrderSuccess()
      onClose()
      alert('Order placed successfully! You will receive a confirmation shortly.')
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Checkout</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {paymentStep === 'details' && (
            <>
              {/* Delivery Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Delivery Available:</strong> Northern Ghana only (Northern, Upper East, Upper West, North East, Savannah)
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0XX XXX XXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House number, street name, area"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region *
                    </label>
                    <select
                      value={deliveryRegion}
                      onChange={(e) => setDeliveryRegion(e.target.value as typeof deliveryRegion)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="Northern">Northern</option>
                      <option value="Upper East">Upper East</option>
                      <option value="Upper West">Upper West</option>
                      <option value="North East">North East</option>
                      <option value="Savannah">Savannah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Any special instructions for delivery..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image_url || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                          <div className="text-xs text-gray-500">
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                            {item.selectedSize && <span className="ml-2">Size: {item.selectedSize}</span>}
                            <span className="ml-2">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
            
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatPrice(getTotalAmount())}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
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

                {paymentMethod === 'momo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number for Payment
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0XX XXX XXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You will receive a prompt on this number to complete payment
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {paymentStep === 'payment' && paymentMethod === 'stripe' && clientSecret && (
            <div>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setPaymentStep('details')}
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                >
                  ← Back to details
                </button>
              </div>
              
              <StripeCheckoutForm
                clientSecret={clientSecret}
                onPaymentSuccess={handleStripePaymentSuccess}
                onPaymentError={handleStripePaymentError}
                totalAmount={getTotalAmount()}
              />
            </div>
          )}

          {paymentStep === 'details' && (
            <button
              onClick={handleProceedToPayment}
              disabled={loading || !phoneNumber || !deliveryAddress || !deliveryRegion}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 
               paymentMethod === 'stripe' ? `Proceed to Payment - ${formatPrice(getTotalAmount())}` :
               `Place Order - ${formatPrice(getTotalAmount())}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckoutModal