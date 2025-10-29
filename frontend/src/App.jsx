import React, { useState, useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { AppProvider } from './context/AppContext'
import { WalletProvider } from './context/WalletContext'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import SEO from './components/SEO'
import PWAInstaller from './components/PWAInstaller'
import OfflineIndicator from './components/OfflineIndicator'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Search from './pages/Search'
import PropertyDetails from './pages/PropertyDetails'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import Maintenance from './pages/Maintenance'
import NotificationToast from './components/NotificationToast'
import OnboardingWizard from './components/OnboardingWizard'
import { useAnalytics } from './utils/analytics'
import { useOffline } from './hooks/useOffline'
import './index.css'
import './styles/animations.css'

function AppContent({ onWalletConnected }) {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [notification, setNotification] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isMaintenance, setIsMaintenance] = useState(false)
  
  const analytics = useAnalytics()
  const isOffline = useOffline()

  // Listen for wallet connection event
  useEffect(() => {
    if (onWalletConnected) {
      const hasCompletedOnboarding = localStorage.getItem('zurirent_onboarding_complete')
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true)
      }
    }
  }, [onWalletConnected])

  useEffect(() => {
    // Initialize analytics
    analytics.init({
      enabled: import.meta.env.PROD,
      trackingId: import.meta.env.VITE_ANALYTICS_ID
    })

    // Check maintenance mode
    checkMaintenanceMode()

    // Track app launch
    analytics.trackEvent('app', 'launch')
  }, [])

  const checkMaintenanceMode = async () => {
    try {
      const maintenanceMode = localStorage.getItem('zurirent_maintenance')
      if (maintenanceMode === 'true') {
        setIsMaintenance(true)
      }
    } catch (error) {
      // Handle error silently
    }
  }

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
    
    // Track notification
    analytics.trackEvent('ui', 'notification_shown', type)
  }

  const handleOnboardingComplete = (userData) => {
    localStorage.setItem('zurirent_onboarding_complete', 'true')
    setShowOnboarding(false)
    showNotification('Welcome to ZuriRent!', 'success')
    
    analytics.trackEvent('onboarding', 'completed')
    analytics.setUserProperties({
      role: userData.role,
      onboardingCompleted: true
    })
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    analytics.trackPageView(`/${page}`)
    analytics.trackEvent('navigation', 'page_change', page)
  }

  const renderPage = () => {
    if (isMaintenance) {
      return <Maintenance />
    }

    switch (currentPage) {
      case 'search':
        return <Search onPropertySelect={setSelectedProperty} />
      case 'property':
        return <PropertyDetails property={selectedProperty} />
      case 'dashboard':
        return <Dashboard />
      case 'admin':
        return <AdminDashboard />
      case 'not-found':
        return <NotFound onPageChange={handlePageChange} />
      default:
        return <Home onGetStarted={() => handlePageChange('search')} />
    }
  }

  return (
    <>
      <SEO />
      
      <div className="min-h-screen bg-secondary dark:bg-gray-900 transition-colors">
        <Navbar 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          onPropertySelect={setSelectedProperty}
        />
        
        <main>
          {renderPage()}
        </main>
        
        {/* Global Components */}
        {isOffline && <OfflineIndicator />}
        <ScrollToTop />
        <PWAInstaller />
        
        {notification && (
          <NotificationToast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        
        {showOnboarding && (
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        )}
      </div>
    </>
  )
}

function App() {
  const [walletConnected, setWalletConnected] = useState(false)

  const handleWalletConnected = (account) => {
    setWalletConnected(true)
    console.log('Wallet connected:', account)
  }

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <HelmetProvider>
        <ThemeProvider>
          <WalletProvider onWalletConnected={handleWalletConnected}>
            <AppProvider>
              <AppContent onWalletConnected={walletConnected} />
            </AppProvider>
          </WalletProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App