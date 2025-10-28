import React from 'react'
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react'

const NotificationToast = ({ message, type = 'info', onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-accent" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error" />
      default:
        return <Info className="h-5 w-5 text-primary" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg shadow-lg ${getBackgroundColor()} max-w-sm`}>
      <div className="flex items-start space-x-3 p-4">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-text">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default NotificationToast