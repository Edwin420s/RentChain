import React, { useState } from 'react'
import { AlertTriangle, MessageSquare, FileText, CheckCircle, XCircle } from 'lucide-react'

const DisputeResolution = ({ disputes }) => {
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [resolutionMessage, setResolutionMessage] = useState('')

  const handleResolveDispute = (disputeId, resolution) => {
    // In a real app, this would call a smart contract
    console.log(`Resolving dispute ${disputeId} with resolution: ${resolution}`)
    setSelectedDispute(null)
    setResolutionMessage('')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'escalated':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Dispute Resolution</h3>
        <div className="text-sm text-gray-600">
          {disputes.filter(d => d.status === 'open').length} open disputes
        </div>
      </div>

      {/* Disputes List */}
      <div className="grid gap-4">
        {disputes.map(dispute => (
          <div key={dispute.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-text">{dispute.title}</h4>
                  <p className="text-gray-600 text-sm">{dispute.property}</p>
                  <p className="text-gray-500 text-sm">Raised by: {dispute.raisedBy}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dispute.status)}`}>
                {dispute.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{dispute.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Amount: ${dispute.amount}</span>
              <span>Created: {new Date(dispute.createdAt).toLocaleDateString()}</span>
            </div>

            {dispute.evidence && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <FileText className="h-4 w-4" />
                  <span>Evidence Provided:</span>
                </div>
                <div className="flex space-x-2">
                  {dispute.evidence.map((file, index) => (
                    <button
                      key={index}
                      className="bg-secondary px-3 py-1 rounded text-sm text-text hover:bg-gray-200 transition-colors"
                    >
                      {file.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dispute.status === 'open' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedDispute(dispute)}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Resolve Dispute</span>
                </button>
                <button className="flex items-center space-x-2 bg-secondary text-text px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <FileText className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-text">Resolve Dispute</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedDispute.title}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Resolution Message
                </label>
                <textarea
                  value={resolutionMessage}
                  onChange={(e) => setResolutionMessage(e.target.value)}
                  rows={4}
                  placeholder="Explain your resolution decision..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleResolveDispute(selectedDispute.id, 'tenant_favor')}
                  className="flex items-center justify-center space-x-2 bg-green-100 text-green-800 p-3 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Favor Tenant</span>
                </button>
                <button
                  onClick={() => handleResolveDispute(selectedDispute.id, 'landlord_favor')}
                  className="flex items-center justify-center space-x-2 bg-red-100 text-red-800 p-3 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Favor Landlord</span>
                </button>
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedDispute(null)}
                className="flex-1 bg-secondary text-text py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveDispute(selectedDispute.id, 'compromise')}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors"
                disabled={!resolutionMessage}
              >
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {disputes.length === 0 && (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600">No disputes found</div>
          <div className="text-sm text-gray-500 mt-1">
            All rental agreements are currently dispute-free
          </div>
        </div>
      )}
    </div>
  )
}

export default DisputeResolution