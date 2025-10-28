import React, { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString())
  }

  if (isInstalled || !showInstallPrompt) {
    return null
  }

  // Check if user recently dismissed the prompt
  const lastDismissed = localStorage.getItem('pwa_prompt_dismissed')
  if (lastDismissed && Date.now() - parseInt(lastDismissed) < 7 * 24 * 60 * 60 * 1000) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm animate-bounce-in">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Download className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-text text-sm mb-1">
            Install RentChain App
          </h3>
          <p className="text-gray-600 text-xs mb-3">
            Install our app for a better experience with offline support and faster loading.
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-primary text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="bg-secondary text-text py-2 px-3 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PWAInstaller