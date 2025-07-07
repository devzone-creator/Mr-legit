import React from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import FeaturedProducts from '../components/FeaturedProducts'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Newsletter />
      <Footer />
    </div>
  )
}

export default HomePage