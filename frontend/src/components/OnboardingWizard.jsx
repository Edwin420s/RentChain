import React, { useState } from 'react'
import { User, Home, Shield, CheckCircle } from 'lucide-react'

const OnboardingWizard = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [userData, setUserData] = useState({
    role: '',
    name: '',
    email: '',
    phone: '',
    profileType: '',
    verification: {}
  })

  const steps = [
    { number: 1, title: 'Welcome', icon: User },
    { number: 2, title: 'Profile', icon: User },
    { number: 3, title: 'Verification', icon: Shield },
    { number: 4, title: 'Complete', icon: CheckCircle }
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(userData)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
              <Home className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text">Welcome to RentChain</h2>
            <p className="text-gray-600">
              Let's set up your account. Are you looking to rent properties or list your own?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setUserData(prev => ({ ...prev, role: 'tenant' }))
                  handleNext()
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-all text-left"
              >
                <User className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-text mb-2">I'm a Tenant</h3>
                <p className="text-sm text-gray-600">
                  Looking for properties to rent
                </p>
              </button>
              <button
                onClick={() => {
                  setUserData(prev => ({ ...prev, role: 'landlord' }))
                  handleNext()
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-all text-left"
              >
                <Home className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-text mb-2">I'm a Landlord</h3>
                <p className="text-sm text-gray-600">
                  Want to list and manage properties
                </p>
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text">Complete Your Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text">Identity Verification</h2>
            <p className="text-gray-600">
              Verify your identity to build trust in the RentChain community.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-text">Email Verification</h3>
                  <p className="text-sm text-gray-600">Verify your email address</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm">
                  Verify
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-text">Phone Verification</h3>
                  <p className="text-sm text-gray-600">Verify your phone number</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm">
                  Verify
                </button>
              </div>

              {userData.role === 'landlord' && (
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-text">Property Ownership</h3>
                    <p className="text-sm text-gray-600">Verify property ownership documents</p>
                  </div>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm">
                    Upload
                  </button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can skip verification for now, but verified users get better visibility and trust scores.
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text">Setup Complete!</h2>
            <p className="text-gray-600">
              Your RentChain account is ready. Start exploring the platform and {userData.role === 'tenant' ? 'find your perfect home' : 'list your properties'}.
            </p>
            <div className="bg-secondary rounded-lg p-4 text-left">
              <h3 className="font-semibold text-text mb-2">Next Steps:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Complete your profile verification</li>
                <li>• {userData.role === 'tenant' ? 'Browse available properties' : 'Add your first property listing'}</li>
                <li>• Connect your wallet for blockchain transactions</li>
                <li>• Set up payment methods</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Progress Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.number ? 'text-primary' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="bg-secondary text-text px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            {currentStep === steps.length ? 'Get Started' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingWizard