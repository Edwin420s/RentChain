import React from 'react'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary opacity-20">404</div>
          <h1 className="text-3xl font-bold text-text mt-4">Page Not Found</h1>
          <p className="text-gray-600 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full bg-secondary text-text py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate('/search')}
            className="w-full bg-white border border-gray-300 text-text py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>Browse Properties</span>
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  )
}

export default NotFound