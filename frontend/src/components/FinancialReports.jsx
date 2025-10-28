import React, { useState } from 'react'
import { Download, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react'

const FinancialReports = ({ transactions, timeRange = 'monthly' }) => {
  const [selectedRange, setSelectedRange] = useState(timeRange)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = {
    all: 'All Transactions',
    rent: 'Rent Payments',
    deposit: 'Security Deposits',
    fee: 'Platform Fees',
    refund: 'Refunds',
    other: 'Other'
  }

  const financialSummary = {
    totalRevenue: 124580,
    totalExpenses: 28750,
    netIncome: 95830,
    pendingPayments: 12500,
    averageRent: 2450,
    occupancyRate: 0.94
  }

  const generateReport = () => {
    // In a real app, this would generate and download a PDF/Excel report
    console.log('Generating financial report...')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getTrendIcon = (value, previousValue) => {
    const trend = value >= previousValue ? 'up' : 'down'
    const Icon = trend === 'up' ? TrendingUp : TrendingDown
    const color = trend === 'up' ? 'text-accent' : 'text-error'
    
    return <Icon className={`h-4 w-4 ${color}`} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Financial Reports</h2>
          <p className="text-gray-600">Track your rental income and expenses</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-secondary text-text px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          <button 
            onClick={generateReport}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">Time Range:</span>
        </div>
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

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
          <div className="text-2xl font-bold text-text mb-2">
            {formatCurrency(financialSummary.totalRevenue)}
          </div>
          <div className="flex items-center space-x-1 text-sm text-accent">
            {getTrendIcon(financialSummary.totalRevenue, 110000)}
            <span>+12.5% from last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Net Income</div>
          <div className="text-2xl font-bold text-text mb-2">
            {formatCurrency(financialSummary.netIncome)}
          </div>
          <div className="flex items-center space-x-1 text-sm text-accent">
            {getTrendIcon(financialSummary.netIncome, 85000)}
            <span>+15.8% from last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Pending Payments</div>
          <div className="text-2xl font-bold text-text mb-2">
            {formatCurrency(financialSummary.pendingPayments)}
          </div>
          <div className="text-sm text-gray-600">Due within 30 days</div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Occupancy Rate</div>
          <div className="text-2xl font-bold text-text mb-2">
            {(financialSummary.occupancyRate * 100).toFixed(1)}%
          </div>
          <div className="flex items-center space-x-1 text-sm text-accent">
            {getTrendIcon(financialSummary.occupancyRate, 0.92)}
            <span>+2.1% from last period</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categories).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              selectedCategory === key
                ? 'bg-primary text-white'
                : 'bg-secondary text-text hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-text">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions
                .filter(tx => selectedCategory === 'all' || tx.category === selectedCategory)
                .map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.property}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.amount >= 0 ? 'text-accent' : 'text-error'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {transactions.filter(tx => selectedCategory === 'all' || tx.category === selectedCategory).length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No transactions found</div>
            <div className="text-sm text-gray-600">
              {selectedCategory !== 'all' 
                ? `No ${categories[selectedCategory].toLowerCase()} in this period`
                : 'No transactions in this period'
              }
            </div>
          </div>
        )}
      </div>

      {/* Summary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-text mb-4">Income vs Expenses</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rental Income</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-accent rounded-full"></div>
                <span className="text-sm font-medium text-text">
                  {formatCurrency(financialSummary.totalRevenue)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expenses</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-2 bg-error rounded-full"></div>
                <span className="text-sm font-medium text-text">
                  {formatCurrency(financialSummary.totalExpenses)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-text">Net Income</span>
              <span className="text-sm font-bold text-text">
                {formatCurrency(financialSummary.netIncome)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-text mb-4">Category Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(categories)
              .filter(([key]) => key !== 'all')
              .map(([key, label]) => {
                const amount = transactions
                  .filter(tx => tx.category === key)
                  .reduce((sum, tx) => sum + tx.amount, 0)
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{label}</span>
                    <span className={`text-sm font-medium ${
                      amount >= 0 ? 'text-accent' : 'text-error'
                    }`}>
                      {formatCurrency(amount)}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialReports