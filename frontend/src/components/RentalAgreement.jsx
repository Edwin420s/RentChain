import React, { useState } from 'react'
import { FileText, Calendar, DollarSign, Shield, Download } from 'lucide-react'

const RentalAgreement = ({ agreement, onSign, onDownload }) => {
  const [isSigning, setIsSigning] = useState(false)

  const handleSign = async () => {
    setIsSigning(true)
    try {
      // In real app, this would trigger wallet signature
      await new Promise(resolve => setTimeout(resolve, 2000))
      onSign(agreement.id)
    } catch (error) {
      console.error('Signing failed:', error)
    } finally {
      setIsSigning(false)
    }
  }

  const terms = [
    'Rent due on 1st of each month',
    'Security deposit held in escrow',
    '30-day notice for termination',
    'No smoking in the property',
    'Pets allowed with additional deposit',
    'Maintenance requests through platform'
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-text">Rental Agreement</h3>
            <p className="text-sm text-gray-600">Smart Contract #{agreement.id}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          agreement.status === 'active' ? 'bg-green-100 text-green-800' :
          agreement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {agreement.status}
        </div>
      </div>

      {/* Agreement Details */}
      <div className="p-6 space-y-6">
        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-text mb-3">Landlord</h4>
            <div className="bg-secondary rounded-lg p-4">
              <div className="font-medium">{agreement.landlord.name}</div>
              <div className="text-sm text-gray-600">{agreement.landlord.wallet}</div>
              <div className="text-sm text-gray-600">{agreement.landlord.email}</div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-text mb-3">Tenant</h4>
            <div className="bg-secondary rounded-lg p-4">
              <div className="font-medium">{agreement.tenant.name}</div>
              <div className="text-sm text-gray-600">{agreement.tenant.wallet}</div>
              <div className="text-sm text-gray-600">{agreement.tenant.email}</div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div>
          <h4 className="font-semibold text-text mb-3">Property</h4>
          <div className="bg-secondary rounded-lg p-4">
            <div className="font-medium">{agreement.property.title}</div>
            <div className="text-sm text-gray-600">{agreement.property.location}</div>
            <div className="text-sm text-gray-600">
              {agreement.property.bedrooms} bed, {agreement.property.bathrooms} bath
            </div>
          </div>
        </div>

        {/* Financial Terms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-sm text-gray-600">Monthly Rent</div>
            <div className="text-lg font-semibold text-text">${agreement.rentAmount}</div>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-sm text-gray-600">Security Deposit</div>
            <div className="text-lg font-semibold text-text">${agreement.depositAmount}</div>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-sm text-gray-600">Duration</div>
            <div className="text-lg font-semibold text-text">{agreement.duration} months</div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div>
          <h4 className="font-semibold text-text mb-3">Terms & Conditions</h4>
          <div className="bg-secondary rounded-lg p-4 max-h-48 overflow-y-auto">
            <ul className="space-y-2">
              {terms.map((term, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Start Date:</span>
            <div className="font-medium text-text">
              {new Date(agreement.startDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="text-gray-600">End Date:</span>
            <div className="font-medium text-text">
              {new Date(agreement.endDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onDownload}
          className="flex items-center space-x-2 bg-white border border-gray-300 text-text px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </button>
        
        {agreement.status === 'pending' && (
          <button
            onClick={handleSign}
            disabled={isSigning}
            className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-4 w-4" />
            <span>{isSigning ? 'Signing...' : 'Sign Agreement'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default RentalAgreement