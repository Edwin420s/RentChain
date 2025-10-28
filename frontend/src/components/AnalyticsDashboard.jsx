import React, { useState } from 'react'
import { TrendingUp, Users, DollarSign, Home, Calendar } from 'lucide-react'

const AnalyticsDashboard = ({ data, timeRange = 'monthly' }) => {
  const [selectedRange, setSelectedRange] = useState(timeRange)

  const stats = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      label: 'Total Revenue',
      value: '$124,580',
      change: '+18.2%',
      trend: 'up'
    },
    {
      icon: <Home className="h-6 w-6" />,
      label: 'Properties Listed',
      value: '45',
      change: '+12.5%',
      trend: 'up'
    },
    {
      icon: <Users className="h-6 w-6" />,
      label: 'Active Tenants',
      value: '32',
      change: '+8.3%',
      trend: 'up'
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      label: 'Occupancy Rate',
      value: '94%',
      change: '+2.1%',
      trend: 'up'
    }
  ]

  const chartData = {
    monthly: [
      { month: 'Jan', revenue: 12000, properties: 8, tenants: 6 },
      { month: 'Feb', revenue: 18000, properties: 12, tenants: 9 },
      { month: 'Mar', revenue: 15000, properties: 10, tenants: 8 },
      { month: 'Apr', revenue: 22000, properties: 15, tenants: 12 },
      { month: 'May', revenue: 25000, properties: 18, tenants: 14 },
      { month: 'Jun', revenue: 30000, properties: 22, tenants: 16 }
    ],
    quarterly: [
      { quarter: 'Q1', revenue: 45000, properties: 30, tenants: 23 },
      { quarter: 'Q2', revenue: 77000, properties: 55, tenants: 42 },
      { quarter: 'Q3', revenue: 92000, properties: 68, tenants: 51 },
      { quarter: 'Q4', revenue: 110000, properties: 82, tenants: 64 }
    ]
  }

  const getMaxValue = (data, key) => {
    return Math.max(...data.map(item => item[key]))
  }

  const renderBarChart = (data, key, color) => {
    const maxValue = getMaxValue(data, key)
    
    return (
      <div className="flex items-end space-x-2 h-32">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full rounded-t transition-all hover:opacity-80"
              style={{
                height: `${(item[key] / maxValue) * 100}%`,
                backgroundColor: color,
                minHeight: '4px'
              }}
            />
            <div className="text-xs text-gray-600 mt-2">
              {item.month || item.quarter}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your rental business performance</p>
        </div>
        <div className="flex space-x-2">
          {['weekly', 'monthly', 'quarterly', 'yearly'].map(range => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 rounded text-sm font-medium capitalize ${
                selectedRange === range
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-text hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary bg-opacity-10 rounded-lg text-primary">
                {stat.icon}
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-accent' : 'text-error'
              }`}>
                <TrendingUp className="h-4 w-4" />
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-text mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-text mb-4">Revenue Trend</h3>
          {renderBarChart(chartData[selectedRange] || chartData.monthly, 'revenue', '#3B82F6')}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>Total Revenue</span>
            <span className="font-semibold text-text">
              ${chartData[selectedRange]?.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Properties Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-text mb-4">Properties & Tenants</h3>
          <div className="space-y-4">
            {renderBarChart(chartData[selectedRange] || chartData.monthly, 'properties', '#10B981')}
            {renderBarChart(chartData[selectedRange] || chartData.monthly, 'tenants', '#8B5CF6')}
          </div>
          <div className="flex items-center space-x-4 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Properties</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-600">Tenants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-text mb-3">Average Rent</h4>
          <div className="text-2xl font-bold text-text">$2,450</div>
          <div className="text-sm text-gray-600 mt-1">+5.2% from last period</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-text mb-3">Vacancy Rate</h4>
          <div className="text-2xl font-bold text-text">6.2%</div>
          <div className="text-sm text-gray-600 mt-1">-1.8% from last period</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-text mb-3">Tenant Retention</h4>
          <div className="text-2xl font-bold text-text">87%</div>
          <div className="text-sm text-gray-600 mt-1">+3.1% from last period</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-text mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'New rental agreement signed', property: 'Westlands Apartment', time: '2 hours ago', type: 'agreement' },
            { action: 'Rent payment received', property: 'Kilimani House', time: '5 hours ago', type: 'payment' },
            { action: 'Property listed', property: 'Kileleshwa Villa', time: '1 day ago', type: 'listing' },
            { action: 'Maintenance request', property: 'Lavington Suite', time: '2 days ago', type: 'maintenance' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'agreement' ? 'bg-blue-500' :
                  activity.type === 'payment' ? 'bg-green-500' :
                  activity.type === 'listing' ? 'bg-purple-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <div className="text-sm text-text">{activity.action}</div>
                  <div className="text-xs text-gray-600">{activity.property}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard