import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import FeaturedProducts from '../components/FeaturedProducts'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'
import SearchModal from '../components/SearchModal'
import CartSidebar from '../components/CartSidebar'
import AuthModal from '../components/AuthModal'
import CheckoutModal from '../components/CheckoutModal'
import { getCurrentUser, User } from '../lib/auth'

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

interface CartItem {
  id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
  selectedColor?: string
  selectedSize?: string
}

const HomePage = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error loading user:', error)
    }
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
        price: product.price,
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

  return (
    <div className="min-h-screen">
      <Header 
        onSearchToggle={() => setIsSearchOpen(true)}
        onCartToggle={() => setIsCartOpen(true)}
        onAuthToggle={() => setIsAuthOpen(true)}
        cartItemsCount={getTotalCartItems()}
        user={user}
        onSignOut={loadUser}
      />
      <Hero />
      <Categories />
      <FeaturedProducts onAddToCart={handleAddToCart} />
      <Newsletter />
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

export default HomePage