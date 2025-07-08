import React from 'react'
import { X, ShoppingBag, Trash2 } from 'lucide-react'

interface WishlistItem {
  id: string
  name: string
  price: number
  image_url: string | null
  brand: string | null
}

interface WishlistSidebarProps {
  isOpen: boolean
  onClose: () => void
  wishlistItems: WishlistItem[]
  onRemoveItem: (id: string) => void
  onAddToCart: (item: WishlistItem) => void
}

const WishlistSidebar = ({ 
  isOpen, 
  onClose, 
  wishlistItems, 
  onRemoveItem, 
  onAddToCart 
}: WishlistSidebarProps) => {
  const formatPrice = (price: number) => {
    return `₵${price.toFixed(2)}`
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Wishlist</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Your wishlist is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    <img
                      src={item.image_url || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                      {item.brand && (
                        <p className="text-xs text-gray-500">{item.brand}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onAddToCart(item)}
                            className="p-1 hover:bg-primary-100 rounded text-primary-600"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                            title="Remove from Wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {wishlistItems.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <p className="text-sm text-gray-600 text-center">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default WishlistSidebar