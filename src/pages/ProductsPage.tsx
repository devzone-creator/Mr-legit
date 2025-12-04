import React, { useState, useEffect } from 'react'
import { Heart, Star, ShoppingBag } from 'lucide-react'
import { fetchProducts, ApiProduct } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SearchModal from '../components/SearchModal'
import CartSidebar from '../components/CartSidebar'
import WishlistSidebar from '../components/WishlistSidebar'
import AuthModal from '../components/AuthModal'
import CheckoutModal from '../components/CheckoutModal'
import { getCurrentUser, User } from '../lib/auth'

type Product = ApiProduct & {
  category?: string | null
}

interface CartItem {
  id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

interface WishlistItem {
  id: string
  name: string
  price: number
  image_url: string | null
  brand: string | null
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [user, setUser] = useState<User | null>(null)

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'mens-fashion', name: 'Men\'s Fashion' },
    { id: 'iphone-accessories', name: 'iPhone Accessories' },
    { id: 'sale', name: 'Sale Items' }
  ]

  useEffect(() => {
    loadUser()
    loadProducts()
  }, [activeCategory])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const all = await fetchProducts()
      let filtered = all
      if (activeCategory !== 'all') {
        if (activeCategory === 'sale') {
          filtered = all.filter((p) => (p.discount ?? 0) > 0)
        } else {
          filtered = all.filter((p) => (p as Product).category === activeCategory)
        }
      }
      setProducts(filtered as Product[])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([]) // Set empty array on error to prevent undefined.map
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWishlist = (product: Product) => {
    const existingItem = wishlistItems.find(item => item.id === product.id)
    
    if (!existingItem) {
      const newItem: WishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price || 0,
        image_url: product.image_url,
        brand: product.brand
      }
      setWishlistItems([...wishlistItems, newItem])
    }
  }

  const handleRemoveFromWishlist = (id: string) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id))
  }

  const handleAddWishlistToCart = (item: WishlistItem) => {
    const product: Product = {
      id: item.id,
      name: item.name,
      description: null,
      price: item.price,
      original_price: null,
      category: null,
      brand: item.brand,
      image_url: item.image_url,
      images: null,
      colors: null,
      sizes: null,
      is_featured: null,
      is_new: null,
      is_active: null,
      discount: null,
      rating: 0,
      review_count: 0,
      created_at: null
    }
    handleAddToCart(product)
    handleRemoveFromWishlist(item.id)
  }

  const handleAddToCart = (product: Product, selectedColor?: string, selectedSize?: string) => {
    const existingItem = cartItems.find(
      item => item.id === product.id && 
      item.selectedColor === selectedColor && 
      item.selectedSize === selectedSize
    )

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === existingItem.id && 
        item.selectedColor === selectedColor && 
        item.selectedSize === selectedSize
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price || 0,
        image_url: product.image_url,
        quantity: 1,
        selectedColor,
        selectedSize
      }
      setCartItems([...cartItems, newItem])
    }
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const handleCheckout = () => {
    if (!user) {
      setIsCartOpen(false)
      setAuthMode('signin')
      setIsAuthOpen(true)
      return
    }
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const handleOrderSuccess = () => {
    setCartItems([])
  }

  const handleAuthSuccess = () => {
    loadUser()
  }

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalWishlistItems = () => {
    return wishlistItems.length
  }

  const formatPrice = (price: number | null) => {
    return `₵${(price ?? 0).toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearchToggle={() => setIsSearchOpen(true)}
        onCartToggle={() => setIsCartOpen(true)}
        onWishlistToggle={() => setIsWishlistOpen(true)}
        onAuthToggle={() => setIsAuthOpen(true)}
        cartItemsCount={getTotalCartItems()}
        wishlistItemsCount={getTotalWishlistItems()}
        user={user}
        onSignOut={loadUser}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our complete collection of premium men's fashion and iPhone accessories
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    {product.discount && product.discount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      onClick={() => handleAddToWishlist(product)}
                    >
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      onClick={() => handleAddToCart(product, product.colors?.[0], product.sizes?.[0])}
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
                      {product.original_price && product.original_price > (product.price || 0) && (
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
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        )}
      </div>

      <Footer />
      
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
      
      <WishlistSidebar
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveItem={handleRemoveFromWishlist}
        onAddToCart={handleAddWishlistToCart}
      />
      
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        mode={authMode}
        onModeChange={setAuthMode}
      />
      
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  )
}

export default ProductsPage