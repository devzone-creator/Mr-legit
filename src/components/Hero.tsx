import React from 'react'
import { ArrowRight, Star } from 'lucide-react'

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="flex items-center bg-ghana-gold/20 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-ghana-gold mr-1" />
                <span className="text-sm font-medium text-ghana-green">Premium Quality</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Fashion That
              <span className="block text-primary-600">Defines You</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Discover premium fashion pieces crafted for the modern Ghanaian. From traditional elegance to contemporary style.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="btn-primary flex items-center justify-center group">
                Shop Collection
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn-secondary">
                View Lookbook
              </button>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start space-x-8 mt-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Premium Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.9</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Hero Image */}
          <div className="relative animate-slide-up">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Fashion Model"
                className="w-full h-[500px] lg:h-[600px] object-cover rounded-2xl shadow-2xl"
              />
              
              {/* Floating Cards */}
              <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-lg animate-bounce-gentle">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Free Delivery</span>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="text-sm text-gray-600">Starting from</div>
                <div className="text-xl font-bold text-primary-600">₵89</div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-200 rounded-full opacity-20 -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-ghana-gold opacity-20 rounded-full -z-10"></div>
          </div>
        </div>
      </div>
      
      {/* Ghana Flag Colors Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-ghana-red via-ghana-gold to-ghana-green"></div>
    </section>
  )
}

export default Hero