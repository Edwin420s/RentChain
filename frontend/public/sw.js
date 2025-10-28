// Service Worker for RentChain PWA
const CACHE_NAME = 'rentchain-v1.0.0'
const STATIC_CACHE = 'rentchain-static-v1.0.0'
const DYNAMIC_CACHE = 'rentchain-dynamic-v1.0.0'

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/screenshots/desktop.png'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/properties',
  '/api/user/profile'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Install completed')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Install failed', error)
      })
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker: Activate completed')
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone()
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(event.request, responseToCache)
                })
            }
            return networkResponse
          })
          .catch((error) => {
            // Network failed - try to return offline page
            if (event.request.destination === 'document') {
              return caches.match('/offline.html')
            }
            throw error
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered')
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions()
    
    for (const action of pendingActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        })
        
        // Remove from pending actions on success
        await removePendingAction(action.id)
      } catch (error) {
        console.error('Background sync failed for action:', action.id, error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  }
})

// IndexedDB utilities for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RentChainOffline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      // Create object store for pending actions
      if (!db.objectStoreNames.contains('pendingActions')) {
        const store = db.createObjectStore('pendingActions', { 
          keyPath: 'id',
          autoIncrement: true 
        })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
      
      // Create object store for cached data
      if (!db.objectStoreNames.contains('cachedData')) {
        const store = db.createObjectStore('cachedData', { keyPath: 'key' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

async function getPendingActions() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingActions'], 'readonly')
    const store = transaction.objectStore('pendingActions')
    const request = store.getAll()
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function addPendingAction(action) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingActions'], 'readwrite')
    const store = transaction.objectStore('pendingActions')
    const request = store.add({
      ...action,
      timestamp: Date.now()
    })
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function removePendingAction(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingActions'], 'readwrite')
    const store = transaction.objectStore('pendingActions')
    const request = store.delete(id)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Periodically clean up old data
setInterval(async () => {
  try {
    const db = await openDB()
    const transaction = db.transaction(['pendingActions', 'cachedData'], 'readwrite')
    
    // Clean up pending actions older than 7 days
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    const pendingStore = transaction.objectStore('pendingActions')
    const pendingIndex = pendingStore.index('timestamp')
    const oldPending = await pendingIndex.getAll(IDBKeyRange.upperBound(weekAgo))
    
    oldPending.forEach(action => {
      pendingStore.delete(action.id)
    })
    
    // Clean up cached data older than 30 days
    const cachedStore = transaction.objectStore('cachedData')
    const cachedIndex = cachedStore.index('timestamp')
    const oldCached = await cachedIndex.getAll(IDBKeyRange.upperBound(weekAgo))
    
    oldCached.forEach(data => {
      cachedStore.delete(data.key)
    })
    
  } catch (error) {
    console.error('Cleanup failed:', error)
  }
}, 24 * 60 * 60 * 1000) // Run once per day