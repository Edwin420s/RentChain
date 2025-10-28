// Performance monitoring and optimization utilities

export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const debounce = (func, wait, immediate) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

export const lazyLoad = (element, callback) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback()
        observer.unobserve(entry.target)
      }
    })
  })

  observer.observe(element)
  return observer
}

export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })
    })
  )
}

export const measurePerformance = (name, fn) => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`)
  return result
}

export const createPerformanceMarker = (name) => {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${name}-start`)
  }
  
  return () => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      
      const measures = performance.getEntriesByName(name)
      if (measures.length > 0) {
        console.log(`📊 ${name}: ${measures[0].duration.toFixed(2)}ms`)
      }
    }
  }
}

// Memory management
export const cleanupLargeData = (data, maxSize = 100) => {
  if (Array.isArray(data) && data.length > maxSize) {
    return data.slice(-maxSize)
  }
  return data
}

// Cache management
export const createCache = (maxAge = 5 * 60 * 1000) => { // 5 minutes default
  const cache = new Map()

  const set = (key, value) => {
    cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  const get = (key) => {
    const item = cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > maxAge) {
      cache.delete(key)
      return null
    }

    return item.value
  }

  const clear = () => {
    cache.clear()
  }

  const cleanup = () => {
    const now = Date.now()
    for (const [key, item] of cache.entries()) {
      if (now - item.timestamp > maxAge) {
        cache.delete(key)
      }
    }
  }

  // Auto cleanup every minute
  setInterval(cleanup, 60 * 1000)

  return {
    set,
    get,
    clear,
    cleanup
  }
}

// Bundle splitting helper
export const lazyImport = (importFn, exportName = 'default') => {
  return React.lazy(() =>
    importFn().then(module => ({
      default: module[exportName]
    }))
  )
}

// Image optimization
export const optimizeImageUrl = (url, options = {}) => {
  const { width = 800, quality = 80, format = 'webp' } = options
  
  // For demonstration - in real app, use your image CDN
  if (url.includes('unsplash.com') || url.includes('cloudinary.com')) {
    return `${url}?w=${width}&q=${quality}&fm=${format}`
  }
  
  return url
}

// Resource preloading
export const preloadResource = (url, as = 'image') => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = url
  link.as = as
  document.head.appendChild(link)
  
  return () => {
    document.head.removeChild(link)
  }
}

// Critical CSS inlining (for production)
export const inlineCriticalCSS = () => {
  // This would be handled by your build process
  // For demonstration, we'll create a utility to manage critical CSS
  const criticalStyles = `
    /* Critical CSS would be inlined here */
  `
  
  const style = document.createElement('style')
  style.textContent = criticalStyles
  document.head.appendChild(style)
}

export default {
  throttle,
  debounce,
  lazyLoad,
  preloadImages,
  measurePerformance,
  createPerformanceMarker,
  cleanupLargeData,
  createCache,
  lazyImport,
  optimizeImageUrl,
  preloadResource,
  inlineCriticalCSS
}