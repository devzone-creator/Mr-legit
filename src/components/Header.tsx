import React, { useState } from 'react'
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Mr. <span className="text-primary-600">Legit</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Men
            </a>
            <a href="#" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Women
            </a>
            <a href="#" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Accessories
            </a>
            <a href="#" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Sale
            </a>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-700 hover:text-primary-600 transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            <button className="p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <User className="w-5 h-5" />
            </button>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <nav className="flex flex-col space-y-2">
                <a href="#" className="text-gray-700 hover:text-primary-600 font-medium py-2">
                  Home
                </a>
                <a href="#" className="text-gray-700 hover:text-primary-600 font-medium py-2">
                  Men
                </a>
                <a href="#" className="text-gray-700 hover:text-primary-600 font-medium py-2">
                  Women
                </a>
                <a href="#" className="text-gray-700 hover:text-primary-600 font-medium py-2">
                  Accessories
                </a>
                <a href="#" className="text-gray-700 hover:text-primary-600 font-medium py-2">
                  Sale
                </a>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header