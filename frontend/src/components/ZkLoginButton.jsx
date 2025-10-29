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
  const [showConnectModal, setShowConnectModal] = useState(false)

  const handleZkLogin = async () => {
    // zkLogin works independently - show auth options modal
    setShowConnectModal(true)
  }

  const handleWalletAuth = async () => {
    try {
      await connectWallet()
      setShowConnectModal(false)
      // Auto-trigger zkAuth after wallet connection
      setTimeout(() => {
        authenticate()
      }, 500)
    } catch (err) {
      console.error('Wallet authentication failed:', err)
    }
  }

  const handleSocialAuth = async (provider) => {
    try {
      setShowConnectModal(false)
      // Simulate social login with zkProof
      console.log(`Authenticating with ${provider}...`)
      
      // In production, integrate with OAuth providers
      // For now, simulate successful authentication
      showNotification(`Authenticated with ${provider}!`, 'success')
      
      // Generate a mock zkProof for social login
      const mockProof = {
        publicInputs: {
          address: `${provider}_${Date.now()}`,
          timestamp: Date.now(),
          domain: 'ZuriRent'
        },
        commitment: `0x${Math.random().toString(16).slice(2)}`,
        nullifier: `0x${Math.random().toString(16).slice(2)}`,
        verified: true,
        createdAt: Date.now()
      }
      
      // Store proof
      localStorage.setItem('zurirent_zkproof', JSON.stringify(mockProof))
      window.location.reload() // Refresh to update auth state
      
    } catch (err) {
      console.error(`${provider} authentication failed:`, err)
    }
  }

  const showNotification = (message, type) => {
    // Simple notification - in production use your notification system
    alert(message)
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
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
          isAuthenticated && !expired
            ? 'bg-accent text-white border-accent shadow-md'
            : isLoading
            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
            : 'bg-white text-text border-gray-300 hover:bg-secondary hover:border-primary cursor-pointer'
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

      {/* zkLogin Authentication Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowConnectModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">zkLogin - Choose Authentication</h3>
              <p className="text-gray-600 text-sm">
                Select your preferred authentication method with zero-knowledge privacy
              </p>
            </div>

            <div className="space-y-3">
              {/* Wallet Auth Option */}
              <button
                onClick={handleWalletAuth}
                className="w-full flex items-center justify-between bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all font-medium shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 14C10 12.8954 10.8954 12 12 12H28C29.1046 12 30 12.8954 30 14V26C30 27.1046 29.1046 28 28 28H12C10.8954 28 10 27.1046 10 26V14Z" fill="white"/>
                    <path d="M12 12C10.8954 12 10 12.8954 10 14V26C10 27.1046 10.8954 28 12 28H28C29.1046 28 30 27.1046 30 26V14C30 12.8954 29.1046 12 28 12H12ZM8 14C8 11.7909 9.79086 10 12 10H28C30.2091 10 32 11.7909 32 14V26C32 28.2091 30.2091 30 28 30H12C9.79086 30 8 28.2091 8 26V14Z" fill="white"/>
                  </svg>
                  <span>MetaMask Wallet</span>
                </div>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Web3</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Social Auth Options */}
              <button
                onClick={() => handleSocialAuth('Google')}
                className="w-full flex items-center justify-between bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-primary hover:bg-gray-50 transition-all font-medium"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Social</span>
              </button>

              <button
                onClick={() => handleSocialAuth('GitHub')}
                className="w-full flex items-center justify-between bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-primary hover:bg-gray-50 transition-all font-medium"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                  </svg>
                  <span>GitHub</span>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Social</span>
              </button>

              <button
                onClick={() => handleSocialAuth('Apple')}
                className="w-full flex items-center justify-between bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-all font-medium"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span>Apple</span>
                </div>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Social</span>
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-700 mt-4">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Zero-Knowledge Privacy</p>
                    <p>All methods use zkProofs - your credentials are never exposed or stored on our servers.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowConnectModal(false)}
              className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ZkLoginButton