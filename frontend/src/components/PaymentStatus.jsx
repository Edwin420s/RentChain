import React from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

const PaymentStatus = ({ status, amount, date, transactionHash }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-accent" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-error" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-accent'
      case 'pending':
        return 'text-yellow-500'
      case 'failed':
        return 'text-error'
      default:
        return 'text-yellow-500'
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`font-medium capitalize ${getStatusColor()}`}>
            {status}
          </span>
        </div>
        <span className="text-lg font-semibold text-text">${amount}</span>
      </div>
      
      <div className="text-sm text-gray-600 space-y-1">
        <div>Date: {new Date(date).toLocaleDateString()}</div>
        {transactionHash && (
          <div className="truncate">
            TX: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentStatus