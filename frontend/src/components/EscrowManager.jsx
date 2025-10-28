import React, { useState } from 'react'
import { Shield, Clock, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react'

const EscrowManager = ({ escrows, onRelease, onDispute }) => {
  const [selectedEscrow, setSelectedEscrow] = useState(null)

  const getEscrowStatus = (escrow) => {
    if (escrow.dispute) return 'disputed'
    if (escrow.releaseDate && new Date(escrow.releaseDate) <= new Date()) return 'ready'
    if (escrow.releaseDate) return 'locked'
    return 'active'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 bg-blue-100'
      case 'locked':
        return 'text-yellow-600 bg-yellow-100'
      case 'ready':
        return 'text-green-600 bg-green-100'
      case 'disputed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Shield className="h-5 w-5 text-blue-600" />
      case 'locked':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'disputed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Shield className="h-5 w-5 text-gray-600" />
    }
  }

  const handleRelease = async (escrowId) => {
    try {
      // In real app, this would call smart contract
      await onRelease(escrowId)
    } catch (error) {
      console.error('Failed to release escrow:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text">Escrow Management</h3>
          <p className="text-sm text-gray-600">Manage security deposits and rent held in escrow</p>
        </div>
        <div className="text-sm text-gray-600">
          Total in Escrow: ${escrows.reduce((sum, escrow) => sum + escrow.amount, 0)}
        </div>
      </div>

      {/* Escrows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {escrows.map((escrow) => {
          const status = getEscrowStatus(escrow)
          return (
            <div key={escrow.id} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                    {status.toUpperCase()}
                  </span>
                </div>
                <div className="text-lg font-bold text-text">${escrow.amount}</div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Property</div>
                  <div className="font-medium text-text">{escrow.property}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Parties</div>
                  <div className="text-sm text-text">
                    {escrow.landlord} ↔ {escrow.tenant}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="text-sm text-text capitalize">{escrow.type}</div>
                </div>
                {escrow.releaseDate && (
                  <div>
                    <div className="text-sm text-gray-600">Release Date</div>
                    <div className="text-sm text-text">
                      {new Date(escrow.releaseDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {status === 'ready' && (
                  <button
                    onClick={() => handleRelease(escrow.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Release Funds
                  </button>
                )}
                {status === 'active' && !escrow.dispute && (
                  <button
                    onClick={() => onDispute(escrow.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Raise Dispute
                  </button>
                )}
                <button
                  onClick={() => setSelectedEscrow(escrow)}
                  className="bg-secondary text-text py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {escrows.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600">No active escrows</div>
          <div className="text-sm text-gray-500 mt-1">
            Escrows will appear here when you have active rental agreements
          </div>
        </div>
      )}

      {/* Escrow Detail Modal */}
      {selectedEscrow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-text">Escrow Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Escrow ID</div>
                  <div className="font-medium text-text">{selectedEscrow.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Amount</div>
                  <div className="font-medium text-text">${selectedEscrow.amount}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Created</div>
                  <div className="text-sm text-text">
                    {new Date(selectedEscrow.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="text-sm text-text capitalize">{getEscrowStatus(selectedEscrow)}</div>
                </div>
              </div>
              {selectedEscrow.contractAddress && (
                <div>
                  <div className="text-sm text-gray-600">Smart Contract</div>
                  <div className="text-sm font-mono text-text break-all">
                    {selectedEscrow.contractAddress}
                  </div>
                </div>
              )}
            </div>
            <div className="flex p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedEscrow(null)}
                className="flex-1 bg-secondary text-text py-2 px-4 rounded hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EscrowManager