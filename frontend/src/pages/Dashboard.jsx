import React, { useState } from 'react'
import { Home, DollarSign, User, Settings } from 'lucide-react'
import PaymentStatus from '../components/PaymentStatus'
import ZkAuthStatus from '../components/ZkAuthStatus'
import { useWallet } from '../context/WalletContext'

const Dashboard = () => {
  const { isConnected, account } = useWallet()
  const [activeTab, setActiveTab] = useState('properties')

  const mockPayments = [
    { id: 1, status: 'completed', amount: 45000, date: '2024-01-15', transactionHash: '0x1234...5678' },
    { id: 2, status: 'pending', amount: 45000, date: '2024-02-15', transactionHash: '0x8765...4321' },
    { id: 3, status: 'completed', amount: 45000, date: '2023-12-15', transactionHash: '0xabcd...efgh' }
  ]

  const mockProperties = [
    { id: 1, name: 'Westlands Apartment', status: 'occupied', rent: 45000 },
    { id: 2, name: 'Kilimani House', status: 'available', rent: 80000 }
  ]

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your properties and rental agreements</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-text">2</p>
              </div>
              <Home className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-text">$125,000</p>
              </div>
              <DollarSign className="h-8 w-8 text-accent" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tenants</p>
                <p className="text-2xl font-bold text-text">3</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold text-text">0.5 ETH</p>
              </div>
              <Settings className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['properties', 'payments', 'agreements', 'settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'properties' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text mb-4">Your Properties</h3>
                {mockProperties.map(property => (
                  <div key={property.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-text">{property.name}</h4>
                      <p className="text-sm text-gray-600">Rent: KSh {property.rent.toLocaleString('en-KE')}/month</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.status === 'occupied' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">Payment History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockPayments.map(payment => (
                    <PaymentStatus key={payment.id} {...payment} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'agreements' && (
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">Rental Agreements</h3>
                <p className="text-gray-600">Your active rental agreements will appear here.</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">Account Settings</h3>
                <div className="space-y-6">
                  {/* Zero-Knowledge Authentication Status */}
                  <div>
                    <h4 className="text-sm font-medium text-text mb-3">Authentication Status</h4>
                    <ZkAuthStatus />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={account}
                      readOnly
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Notification Preferences
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                        <span className="ml-2 text-sm text-gray-600">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                        <span className="ml-2 text-sm text-gray-600">Payment reminders</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard