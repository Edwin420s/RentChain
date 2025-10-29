import React, { useState } from 'react'
import { Shield, LogIn, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useZkLogin } from '../context/ZkLoginContext'
import { useWallet } from '../context/WalletContext'

const ZkLoginButton = () => {
  const { isConnected } = useWallet()
  const { 
    isAuthenticated, 
    authenticate, 
    logout, 
    isLoading, 
    error,
    isAuthExpired 
  } = useZkLogin()
  
  const [showTooltip, setShowTooltip] = useState(false)

  const handleZkLogin = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      const success = await authenticate()
      if (success) {
        // Show success feedback
        setShowTooltip(true)
        setTimeout(() => setShowTooltip(false), 3000)
      }
    } catch (err) {
      console.error('zkLogin failed:', err)
    }
  }

  const handleLogout = () => {
    logout()
  }

  // Check if auth is expired
  const expired = isAuthenticated && isAuthExpired()

  return (
    <div className="relative">
      <button
        onClick={isAuthenticated ? handleLogout : handleZkLogin}
        disabled={isLoading || !isConnected}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
          isAuthenticated && !expired
            ? 'bg-accent text-white border-accent shadow-md'
            : isLoading
            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
            : !isConnected
            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
            : 'bg-white text-text border-gray-300 hover:bg-secondary hover:border-primary'
        }`}
        onMouseEnter={() => !isLoading && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isAuthenticated && !expired ? (
          <Shield className="h-4 w-4" />
        ) : expired ? (
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isLoading 
            ? 'Authenticating...' 
            : isAuthenticated && !expired
            ? 'zk Verified'
            : expired
            ? 'Re-authenticate'
            : 'zk Login'
          }
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
          {isAuthenticated && !expired ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="font-semibold">Zero-Knowledge Verified</span>
              </div>
              <p className="text-gray-300">
                Your identity is authenticated without revealing your private key. Click to logout.
              </p>
            </div>
          ) : expired ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="font-semibold">Session Expired</span>
              </div>
              <p className="text-gray-300">
                Your authentication has expired. Please re-authenticate.
              </p>
            </div>
          ) : !isConnected ? (
            <p className="text-gray-300">
              Connect your wallet first to use zero-knowledge authentication.
            </p>
          ) : (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-semibold">Privacy-Preserving Auth</span>
              </div>
              <p className="text-gray-300">
                Sign a message to prove ownership without revealing your private key. No gas fees required.
              </p>
            </div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 w-64 bg-red-100 border border-red-300 text-red-800 text-xs rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1">Authentication Failed</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ZkLoginButton