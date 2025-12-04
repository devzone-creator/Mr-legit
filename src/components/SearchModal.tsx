import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { fetchProducts, ApiProduct } from '../lib/api'

type Product = ApiProduct & { category?: string | null }

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchProducts()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const searchProducts = async () => {
    setLoading(true)
    try {
      const all = await fetchProducts()
      const q = searchQuery.toLowerCase()
      const filtered = all.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      )
      setSearchResults(filtered.slice(0, 10) as Product[])
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return `₵${price.toFixed(2)}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-lg"
              autoFocus
            />
            <button
              onClick={onClose}
              className="ml-3 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <div className="loading-spinner mx-auto"></div>
              <p className="mt-2 text-gray-600">Searching...</p>
            </div>
          )}
          
          {!loading && searchQuery.length > 2 && searchResults.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No products found for "{searchQuery}"
            </div>
          )}
          
          {searchResults.map((product) => (
            <div
              key={product.id}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={product.image_url || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=100'}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {product.brand && <span>{product.brand}</span>}
                    {product.category && (
                      <>
                        <span>•</span>
                        <span>{product.category}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPrice(product.price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchModal