import React from 'react'
import { Mail, Phone, Calendar, AlertCircle } from 'lucide-react'

const TenantManagement = ({ tenants }) => {
  const handleContact = (tenant, method) => {
    // In a real app, this would open chat or initiate call
    console.log(`Contacting ${tenant.name} via ${method}`)
  }

  const handleReportIssue = (tenantId) => {
    // In a real app, this would open a dispute modal
    console.log(`Reporting issue for tenant ${tenantId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text">Tenant Management</h3>
        <span className="text-sm text-gray-600">{tenants.length} active tenants</span>
      </div>

      <div className="grid gap-4">
        {tenants.map(tenant => (
          <div key={tenant.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-text text-lg">{tenant.name}</h4>
                <p className="text-gray-600">{tenant.property}</p>
                <p className="text-sm text-gray-500">Since {tenant.startDate}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                tenant.status === 'current' 
                  ? 'bg-green-100 text-green-800'
                  : tenant.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {tenant.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-sm text-gray-600">Rent Due</div>
                <div className="text-lg font-semibold text-text">${tenant.rentDue}</div>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-sm text-gray-600">Days Remaining</div>
                <div className="text-lg font-semibold text-text">{tenant.daysRemaining}</div>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-sm text-gray-600">Payment Status</div>
                <div className={`text-lg font-semibold ${
                  tenant.paymentStatus === 'paid' ? 'text-accent' : 'text-error'
                }`}>
                  {tenant.paymentStatus}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleContact(tenant, 'email')}
                className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </button>
              <button
                onClick={() => handleContact(tenant, 'phone')}
                className="flex items-center space-x-2 bg-secondary text-text px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Phone className="h-4 w-4" />
                <span>Call</span>
              </button>
              <button
                onClick={() => handleContact(tenant, 'schedule')}
                className="flex items-center space-x-2 bg-secondary text-text px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule</span>
              </button>
              <button
                onClick={() => handleReportIssue(tenant.id)}
                className="flex items-center space-x-2 bg-error text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Report Issue</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {tenants.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No active tenants</div>
          <div className="text-sm text-gray-600">Tenants will appear here once they rent your properties</div>
        </div>
      )}
    </div>
  )
}

export default TenantManagement