import React, { useState } from 'react'
import { Wrench, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'

const MaintenanceRequests = ({ requests, onUpdateStatus }) => {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [updateNote, setUpdateNote] = useState('')

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    in_progress: { color: 'bg-blue-100 text-blue-800', icon: Wrench },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
  }

  const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
    medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
    high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
  }

  const handleStatusUpdate = (requestId, newStatus) => {
    onUpdateStatus(requestId, newStatus, updateNote)
    setUpdateNote('')
    setSelectedRequest(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Maintenance Requests</h3>
        <div className="text-sm text-gray-600">
          {requests.filter(r => r.status === 'pending').length} pending requests
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid gap-4">
        {requests.map(request => {
          const StatusIcon = statusConfig[request.status].icon
          const statusColor = statusConfig[request.status].color
          const priorityColor = priorityConfig[request.priority].color
          const priorityLabel = priorityConfig[request.priority].label

          return (
            <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Wrench className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">{request.title}</h4>
                    <p className="text-gray-600 text-sm">{request.property}</p>
                    <p className="text-gray-500 text-sm">Submitted by {request.tenant}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColor}`}>
                    {priorityLabel}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{request.description}</p>

              {request.images && request.images.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Attached Images:</div>
                  <div className="flex space-x-2">
                    {request.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Maintenance issue ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80"
                        onClick={() => window.open(image, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                  {request.updatedAt && (
                    <span>Updated: {new Date(request.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-text">Estimate: ${request.estimate || 'Pending'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-4">
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                      className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm"
                    >
                      <Wrench className="h-4 w-4" />
                      <span>Start Work</span>
                    </button>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center space-x-2 bg-secondary text-text px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Update</span>
                    </button>
                  </>
                )}
                {request.status === 'in_progress' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'completed')}
                      className="flex items-center space-x-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark Complete</span>
                    </button>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center space-x-2 bg-secondary text-text px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Add Note</span>
                    </button>
                  </>
                )}
                <button className="flex items-center space-x-2 bg-secondary text-text px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact Tenant</span>
                </button>
              </div>

              {/* Status History */}
              {request.history && request.history.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Status History:</div>
                  <div className="space-y-2">
                    {request.history.map((history, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <StatusIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{history.action}</span>
                        <span className="text-gray-500">
                          {new Date(history.timestamp).toLocaleDateString()}
                        </span>
                        {history.note && (
                          <span className="text-gray-500">- {history.note}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Update Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-text">Update Request</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedRequest.title}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Update Note
                </label>
                <textarea
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  rows={4}
                  placeholder="Add notes about the maintenance progress..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Update Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedRequest.id, status)}
                      className={`p-3 rounded-lg text-sm font-medium text-center ${
                        selectedRequest.status === status
                          ? 'bg-primary text-white'
                          : 'bg-secondary text-text hover:bg-gray-200'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 bg-secondary text-text py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-8">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600">No maintenance requests</div>
          <div className="text-sm text-gray-500 mt-1">
            Maintenance requests from tenants will appear here
          </div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceRequests