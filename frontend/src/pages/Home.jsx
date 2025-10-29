import React from 'react'
import { Home, Shield, Zap, Users } from 'lucide-react'

const HomePage = ({ onGetStarted }) => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure Escrow',
      description: 'Your deposits are protected by smart contracts and automatically released when terms are met.'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Instant Payments',
      description: 'Pay rent with crypto or local payment methods. Fast, secure, and transparent.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Trust System',
      description: 'Verified reviews and on-chain reputation for both tenants and landlords.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Rent Smarter with Blockchain
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              ZuriRent brings transparency and security to rental housing through smart contracts, escrow protection, and verified listings.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Find Your Home
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">
              Why Choose ZuriRent?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're building the future of rental housing with Web3 technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-text mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-text mb-2">500+</div>
              <div className="text-gray-600">Properties Listed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text mb-2">$2M+</div>
              <div className="text-gray-600">In Secured Deposits</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text mb-2">99%</div>
              <div className="text-gray-600">Dispute-Free Rentals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text mb-2">24/7</div>
              <div className="text-gray-600">Smart Contract Protection</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage