import React from 'react'
import { Home, Search, User, Wallet, AlertCircle } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import ZkLoginButton from './ZkLoginButton'

const Navbar = ({ currentPage, onPageChange, onPropertySelect }) => {
  const { 
    isConnected, 
    account, 
    balance,
    isCorrectNetwork,
    connectWallet, 
    disconnectWallet,
    switchToScrollSepolia 
  } = useWallet()

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (bal) => {
    return parseFloat(bal).toFixed(4)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-text">ZuriRent</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onPageChange('home')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'bg-primary text-white'
                  : 'text-text hover:bg-secondary'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => onPageChange('search')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'search'
                  ? 'bg-primary text-white'
                  : 'text-text hover:bg-secondary'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Find Homes</span>
            </button>
            <button
              onClick={() => onPageChange('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-primary text-white'
                  : 'text-text hover:bg-secondary'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <ZkLoginButton />
            
            {isConnected ? (
              <div className="flex items-center space-x-3">
                {/* Network Warning */}
                {!isCorrectNetwork && (
                  <button
                    onClick={switchToScrollSepolia}
                    className="flex items-center space-x-2 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
                    title="Switch to Scroll Sepolia"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Wrong Network</span>
                  </button>
                )}
                
                {/* Balance & Address */}
                <div className="flex items-center space-x-2 bg-secondary px-3 py-2 rounded-lg">
                  <Wallet className="h-4 w-4 text-text" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">
                      {formatBalance(balance)} ETH
                    </span>
                    <span className="text-sm font-medium text-text">
                      {formatAddress(account)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={disconnectWallet}
                  className="bg-error text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium flex items-center space-x-2"
              >
                <Wallet className="h-5 w-5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
