import React from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { useOffline } from '../hooks/useOffline'

const OfflineIndicator = () => {
  const isOffline = useOffline()

  if (!isOffline) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
      <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">You're offline</span>
      </div>
    </div>
  )
}

export default OfflineIndicator