import React, { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail('')
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <section className="py-16 bg-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Mail className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Stay in Style
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive deals, and fashion tips.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                required
              />
              <button
                type="submit"
                className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Subscribe
              </button>
            </div>
          </form>
          
          {isSubscribed && (
            <div className="mt-4 flex items-center justify-center text-white">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Thank you for subscribing!</span>
            </div>
          )}
          
          <p className="text-sm text-primary-200 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Newsletter