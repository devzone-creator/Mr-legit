import React, { useState, useEffect } from 'react'
import { Heart, Star, ShoppingBag } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Product {
  id: string
  name: string
  price: number
  original_price: number | null
  image_url: string | null
  rating: number
  review_count: number
  discount: number
  is_new: boolean
  brand: string | null
  colors: string[] | null
  sizes: string[] | null
}

interface FeaturedProductsProps {
  onAddToCart: (product: Product, selectedColor?: string, selectedSize?: string) => void
}

const FeaturedProducts = ({ onAddToCart }: FeaturedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8)

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return `₵${price.toFixed(2)}`
  }

  const handleAddToCart = (product: Product) => {
    const defaultColor = product.colors?.[0] || undefined
    const defaultSize = product.sizes?.[0] || undefined
    onAddToCart(product, defaultColor, defaultSize)
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading featured products...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handpicked items that represent the best of Ghanaian fashion and premium iPhone accessories
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="product-card group">
              <div className="relative overflow-hidden">
                <img
                  src={product.image_url || 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.is_new && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      New
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      -{product.discount}%
                    </span>
                  )}
                </div>
                
                {/* Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingBag className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                {product.brand && (
                  <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                )}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.review_count})
                  </span>
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="btn-primary">
            View All Products
          </button>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts