// Analytics and monitoring utilities

class Analytics {
  constructor() {
    this.isInitialized = false
    this.userId = null
    this.sessionId = this.generateSessionId()
  }

  init(config = {}) {
    if (this.isInitialized) return

    const {
      enabled = import.meta.env.PROD,
      trackingId = import.meta.env.VITE_ANALYTICS_ID,
      anonymizeIp = true,
      respectDnt = true
    } = config

    this.enabled = enabled && !this.shouldDisableTracking(respectDnt)
    this.trackingId = trackingId
    this.anonymizeIp = anonymizeIp

    if (this.enabled) {
      this.loadAnalyticsScript()
      this.trackPageView()
      this.isInitialized = true
    }
  }

  shouldDisableTracking(respectDnt) {
    if (respectDnt && navigator.doNotTrack === '1') {
      return true
    }
    return false
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  generateUserId() {
    let userId = localStorage.getItem('zurirent_user_id')
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('zurirent_user_id', userId)
    }
    return userId
  }

  loadAnalyticsScript() {
    // Load your analytics script here
    // For example, Google Analytics, Plausible, or custom solution
    console.log('📊 Analytics initialized')
  }

  trackPageView(path = window.location.pathname, title = document.title) {
    if (!this.enabled) return

    const event = {
      type: 'pageview',
      path,
      title,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    this.sendEvent(event)
  }

  trackEvent(category, action, label = null, value = null) {
    if (!this.enabled) return

    const event = {
      type: 'event',
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    this.sendEvent(event)
  }

  trackError(error, context = {}) {
    if (!this.enabled) return

    const event = {
      type: 'error',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    this.sendEvent(event)
  }

  trackConversion(conversionId, value = null) {
    if (!this.enabled) return

    const event = {
      type: 'conversion',
      conversionId,
      value,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    this.sendEvent(event)
  }

  trackUserAction(action, details = {}) {
    if (!this.enabled) return

    const event = {
      type: 'user_action',
      action,
      details,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    this.sendEvent(event)
  }

  trackPerformance(metric, value, context = {}) {
    if (!this.enabled) return

    const event = {
      type: 'performance',
      metric,
      value,
      context,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    }

    this.sendEvent(event)
  }

  sendEvent(event) {
    // Send event to your analytics service
    // This is a mock implementation
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Event:', event)
    }

    // In production, send to your analytics endpoint
    if (import.meta.env.PROD) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      }).catch(error => {
        console.error('Failed to send analytics event:', error)
      })
    }
  }

  setUserProperties(properties) {
    if (!this.enabled) return

    this.userProperties = { ...this.userProperties, ...properties }
    localStorage.setItem('zurirent_user_properties', JSON.stringify(this.userProperties))
  }

  getUserProperties() {
    return this.userProperties || JSON.parse(localStorage.getItem('zurirent_user_properties') || '{}')
  }

  // E-commerce tracking
  trackProductView(productId, productName, category = null, price = null) {
    this.trackEvent('ecommerce', 'product_view', productId, price)
    this.trackEvent('engagement', 'view_item', `${productName} (${productId})`)
  }

  trackAddToCart(productId, productName, price, quantity = 1) {
    this.trackEvent('ecommerce', 'add_to_cart', productId, price * quantity)
  }

  trackPurchase(orderId, products, total, tax = 0, shipping = 0) {
    this.trackEvent('ecommerce', 'purchase', orderId, total)
    this.trackConversion('purchase', total)
    
    // Track individual products
    products.forEach(product => {
      this.trackEvent('ecommerce', 'purchase_item', product.id, product.price * product.quantity)
    })
  }

  // Rental-specific tracking
  trackPropertyView(propertyId, propertyTitle, price) {
    this.trackProductView(propertyId, propertyTitle, 'property', price)
  }

  trackRentalAgreement(agreementId, propertyId, totalAmount) {
    this.trackEvent('rental', 'agreement_created', agreementId, totalAmount)
    this.trackConversion('rental_agreement', totalAmount)
  }

  trackPayment(agreementId, amount, method) {
    this.trackEvent('rental', 'payment_made', `${agreementId}_${method}`, amount)
  }

  trackDispute(agreementId, type, amount = null) {
    this.trackEvent('rental', 'dispute_raised', `${agreementId}_${type}`, amount)
  }
}

// Create singleton instance
const analytics = new Analytics()

// React Hook for analytics
export const useAnalytics = () => {
  return analytics
}

// Higher-order component for page tracking
export const withAnalytics = (Component) => {
  return function WithAnalyticsWrapper(props) {
    useEffect(() => {
      analytics.trackPageView(window.location.pathname, document.title)
    }, [])

    return <Component {...props} />
  }
}

export default analytics