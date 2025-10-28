import React, { useState } from 'react'
import { CreditCard, Smartphone, Bank, Crypto, Plus, Trash2 } from 'lucide-react'

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'crypto', name: 'MetaMask Wallet', details: '0x742d...35f1', isDefault: true },
    { id: 2, type: 'mpesa', name: 'M-Pesa', details: '+254 712 345 678', isDefault: false },
    { id: 3, type: 'bank', name: 'Equity Bank', details: 'Account •• 4567', isDefault: false }
  ])

  const getIcon = (type) => {
    switch (type) {
      case 'crypto':
        return <Crypto className="h-6 w-6" />
      case 'mpesa':
        return <Smartphone className="h-6 w-6" />
      case 'bank':
        return <Bank className="h-6 w-6" />
      default:
        return <CreditCard className="h-6 w-6" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'crypto':
        return 'text-purple-600'
      case 'mpesa':
        return 'text-green-600'
      case 'bank':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleSetDefault = (id) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    )
  }

  const handleRemoveMethod = (id) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Payment Methods</h3>
        <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add Method</span>
        </button>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map(method => (
          <div key={method.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg bg-gray-50 ${getTypeColor(method.type)}`}>
                  {getIcon(method.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-text">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.details}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {method.isDefault && (
                  <span className="bg-accent text-white px-2 py-1 rounded text-xs font-medium">
                    Default
                  </span>
                )}
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-sm text-primary hover:text-blue-800 font-medium"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleRemoveMethod(method.id)}
                  className="text-gray-400 hover:text-error transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Method Options */}
      <div className="bg-secondary rounded-lg p-6">
        <h4 className="font-semibold text-text mb-4">Available Payment Methods</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <Crypto className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="font-medium text-text">Crypto</div>
            <div className="text-sm text-gray-600">USDC, USDT, ETH</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="font-medium text-text">M-Pesa</div>
            <div className="text-sm text-gray-600">Mobile Money</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
            <Bank className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="font-medium text-text">Bank Transfer</div>
            <div className="text-sm text-gray-600">Direct Deposit</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethods