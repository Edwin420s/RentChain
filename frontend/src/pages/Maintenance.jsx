import React from 'react'
import { Settings, Clock, AlertTriangle } from 'lucide-react'

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Under Maintenance</h1>
          <p className="text-gray-600">
            RentChain is currently undergoing scheduled maintenance. We'll be back online shortly.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-text">Estimated Time</span>
            </div>
            <span className="text-sm text-gray-600">30-60 minutes</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-text">Status</span>
            </div>
            <span className="text-sm text-green-600 font-medium">In Progress</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 space-y-2">
          <p>We're working hard to improve your experience.</p>
          <p>Thank you for your patience!</p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:text-blue-800 font-medium"
          >
            Check Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default Maintenance