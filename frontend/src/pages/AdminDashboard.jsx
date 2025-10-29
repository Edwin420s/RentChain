import React, { useState } from 'react'
import { Users, Home, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react'
import TenantManagement from '../components/TenantManagement'
import DisputeResolution from '../components/DisputeResolution'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    { icon: <Home className="h-6 w-6" />, label: 'Total Properties', value: '156', change: '+12%' },
    { icon: <Users className="h-6 w-6" />, label: 'Active Tenants', value: '89', change: '+5%' },
    { icon: <DollarSign className="h-6 w-6" />, label: 'Monthly Revenue', value: 'KSh 11M', change: '+18%' },
    { icon: <AlertTriangle className="h-6 w-6" />, label: 'Open Disputes', value: '3', change: '-2' }
  ]

  const mockTenants = [
    {
      id: 1,
      name: 'John Kamau',
      property: 'Westlands Apartment #12',
      startDate: '2024-01-15',
      status: 'current',
      rentDue: 45000,
      daysRemaining: 15,
      paymentStatus: 'paid'
    },
    {
      id: 2,
      name: 'Sarah Mwangi',
      property: 'Kilimani House #5',
      startDate: '2024-02-01',
      status: 'current',
      rentDue: 80000,
      daysRemaining: 8,
      paymentStatus: 'pending'
    }
  ]

  const mockDisputes = [
    {
      id: 1,
      title: 'Security Deposit Dispute',
      property: 'Westlands Apartment #12',
      raisedBy: 'John Kamau (Tenant)',
      description: 'Tenant claims the security deposit should be fully refunded as there was no damage to the property.',
      amount: 45000,
      status: 'open',
      createdAt: '2024-03-15',
      evidence: [
        { name: 'move_in_photos.zip' },
        { name: 'move_out_photos.zip' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage properties, tenants, and platform operations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary bg-opacity-10 rounded-lg text-primary">
                  {stat.icon}
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-accent' : 'text-error'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-text mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                'overview',
                'tenants',
                'disputes',
                'analytics',
                'settings'
              ].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-secondary rounded-lg p-6">
                    <h3 className="font-semibold text-text mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {[
                        { action: 'New rental agreement signed', user: 'John Kamau', time: '2 hours ago' },
                        { action: 'Rent payment received', user: 'Sarah Mwangi', time: '5 hours ago' },
                        { action: 'Property listed', user: 'David Ochieng', time: '1 day ago' },
                        { action: 'Dispute resolved', user: 'Admin', time: '2 days ago' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          <div className="flex-1">
                            <div className="text-sm text-text">{activity.action}</div>
                            <div className="text-xs text-gray-500">
                              by {activity.user} • {activity.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Platform Health */}
                  <div className="bg-secondary rounded-lg p-6">
                    <h3 className="font-semibold text-text mb-4">Platform Health</h3>
                    <div className="space-y-4">
                      {[
                        { metric: 'Uptime', value: '99.9%', status: 'good' },
                        { metric: 'Response Time', value: '128ms', status: 'good' },
                        { metric: 'Active Contracts', value: '89', status: 'normal' },
                        { metric: 'Gas Fees', value: 'Low', status: 'good' }
                      ].map((health, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-text">{health.metric}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-text">{health.value}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              health.status === 'good' ? 'bg-accent' : 
                              health.status === 'normal' ? 'bg-yellow-500' : 'bg-error'
                            }`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tenants' && (
              <TenantManagement tenants={mockTenants} />
            )}

            {activeTab === 'disputes' && (
              <DisputeResolution disputes={mockDisputes} />
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text">Platform Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-secondary rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-text">Revenue Trends</span>
                    </div>
                    <div className="text-center py-8 text-gray-500">
                      Revenue chart would be displayed here
                    </div>
                  </div>
                  <div className="bg-secondary rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-text">User Growth</span>
                    </div>
                    <div className="text-center py-8 text-gray-500">
                      User growth chart would be displayed here
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text">Platform Settings</h3>
                <div className="grid gap-4">
                  {[
                    { name: 'Platform Fees', value: '2%', description: 'Transaction fee percentage' },
                    { name: 'Dispute Timeout', value: '14 days', description: 'Time to resolve disputes' },
                    { name: 'Minimum Deposit', value: '1 month rent', description: 'Security deposit requirement' },
                    { name: 'Auto-refund Period', value: '48 hours', description: 'Automatic refund after agreement end' }
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-text">{setting.name}</div>
                        <div className="text-sm text-gray-600">{setting.description}</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-text font-medium">{setting.value}</span>
                        <button className="text-primary hover:text-blue-800 font-medium text-sm">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard