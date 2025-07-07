import React, { useState, useEffect } from 'react'
import { X, MapPin, Phone, CreditCard, Smartphone } from 'lucide-react'
import { getCurrentUser, User } from '../lib/auth'
import { supabase } from '../lib/supabase'

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
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')

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

  const handlePlaceOrder = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Create order
      const orderData = {
        user_id: user.id,
        total_amount: getTotalAmount(),
        status: 'pending',
        delivery_address: `${user.address}, ${user.city}, ${user.region}`,
        delivery_notes: deliveryNotes || null,
        payment_method: paymentMethod,
        phone_number: phoneNumber
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        selected_color: item.selectedColor || null,
        selected_size: item.selectedSize || null
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update order status
      await supabase
        .from('orders')
        .update({ 
          status: 'confirmed',
          payment_reference: `PAY_${Date.now()}`
        })
        .eq('id', order.id)

      onOrderSuccess()
      onClose()
      alert('Order placed successfully! You will receive a confirmation shortly.')
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order. Please try again.')
    } finally {
      setLoading(false)
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
          {/* Delivery Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
            {user && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    {user.address}, {user.city}, {user.region}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">{user.phone}</span>
                </div>
              </div>
            )}
            
            <div className="mt-4">
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
            <div className="grid grid-cols-2 gap-3 mb-4">
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

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !phoneNumber}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing Order...' : `Place Order - ${formatPrice(getTotalAmount())}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutModal