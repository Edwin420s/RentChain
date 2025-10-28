import React, { useState } from 'react'
import { Shield, LogIn } from 'lucide-react'

const ZkLoginButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleZkLogin = async () => {
    try {
      setIsAuthenticated(true)
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  return (
    <button
      onClick={handleZkLogin}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
        isAuthenticated
          ? 'bg-accent text-white border-accent'
          : 'bg-white text-text border-gray-300 hover:bg-secondary'
      }`}
    >
      {isAuthenticated ? (
        <Shield className="h-4 w-4" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      <span className="text-sm font-medium">
        {isAuthenticated ? 'zk Verified' : 'zk Login'}
      </span>
    </button>
  )
}

export default ZkLoginButton