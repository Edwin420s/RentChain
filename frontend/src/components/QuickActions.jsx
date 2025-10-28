import React from 'react'
import { Plus, Search, Download, Upload, MessageCircle, Settings } from 'lucide-react'

const QuickActions = ({ userRole, onAction }) => {
  const landlordActions = [
    {
      icon: <Plus className="h-6 w-6" />,
      title: 'List Property',
      description: 'Add new property to rent',
      action: 'list-property',
      color: 'bg-blue-500'
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: 'Collect Rent',
      description: 'Send rent payment requests',
      action: 'collect-rent',
      color: 'bg-green-500'
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Message Tenants',
      description: 'Contact your tenants',
      action: 'message-tenants',
      color: 'bg-purple-500'
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: 'Manage Properties',
      description: 'Update property details',
      action: 'manage-properties',
      color: 'bg-orange-500'
    }
  ]

  const tenantActions = [
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Find Homes',
      description: 'Browse available properties',
      action: 'find-homes',
      color: 'bg-blue-500'
    },
    {
      icon: <Upload className="h-6 w-6" />,
      title: 'Pay Rent',
      description: 'Make rent payment',
      action: 'pay-rent',
      color: 'bg-green-500'
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Contact Landlord',
      description: 'Send message to landlord',
      action: 'contact-landlord',
      color: 'bg-purple-500'
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: 'My Agreements',
      description: 'View rental contracts',
      action: 'view-agreements',
      color: 'bg-orange-500'
    }
  ]

  const actions = userRole === 'landlord' ? landlordActions : tenantActions

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text">Quick Actions</h3>
        <span className="text-sm text-gray-600">Frequently used features</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={action.action}
            onClick={() => onAction(action.action)}
            className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md hover:border-primary transition-all group"
          >
            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <h4 className="font-semibold text-text mb-1">{action.title}</h4>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-text mb-3">Recent Activity</h4>
        <div className="space-y-3">
          {[
            { action: 'Rent payment received', time: '2 hours ago', type: 'success' },
            { action: 'New tenant application', time: '1 day ago', type: 'info' },
            { action: 'Maintenance request', time: '2 days ago', type: 'warning' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <span className="text-sm text-text">{activity.action}</span>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuickActions