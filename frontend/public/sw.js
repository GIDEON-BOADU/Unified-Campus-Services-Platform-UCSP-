// Service Worker for Background Session Management
const CACHE_NAME = 'ucsp-session-v1';
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Background sync for session management
self.addEventListener('sync', (event) => {
  if (event.tag === 'session-refresh') {
    event.waitUntil(handleSessionRefresh());
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'session-check') {
    event.waitUntil(handleSessionCheck());
  }
});

// Handle session refresh
async function handleSessionRefresh() {
  try {
    const clients = await self.clients.matchAll();
    
    for (const client of clients) {
      // Send message to client to refresh session
      client.postMessage({
        type: 'SESSION_REFRESH_REQUEST',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('Session refresh failed:', error);
  }
}

// Handle periodic session check
async function handleSessionCheck() {
  try {
    const clients = await self.clients.matchAll();
    
    for (const client of clients) {
      // Send message to client to check session status
      client.postMessage({
        type: 'SESSION_CHECK_REQUEST',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('Session check failed:', error);
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'REGISTER_SESSION_SYNC') {
    // Register background sync for session refresh
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      event.waitUntil(
        self.registration.sync.register('session-refresh')
      );
    }
  }
  
  if (event.data && event.data.type === 'REGISTER_PERIODIC_SYNC') {
    // Register periodic background sync for session checks
    if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
      event.waitUntil(
        self.registration.periodicSync.register('session-check', {
          minInterval: SESSION_CHECK_INTERVAL
        })
      );
    }
  }
});

// Handle push notifications for session expiry (if implemented)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    if (data.type === 'SESSION_EXPIRY_WARNING') {
      const options = {
        body: 'Your session will expire soon. Click to refresh.',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'session-expiry',
        requireInteraction: true,
        actions: [
          {
            action: 'refresh',
            title: 'Refresh Session',
            icon: '/refresh-icon.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/dismiss-icon.png'
          }
        ]
      };
      
      event.waitUntil(
        self.registration.showNotification('Session Expiry Warning', options)
      );
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'refresh') {
    // Handle refresh action
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        for (const client of clients) {
          client.postMessage({
            type: 'FORCE_SESSION_REFRESH',
            timestamp: Date.now()
          });
        }
      })
    );
  } else if (event.action === 'dismiss') {
    // Handle dismiss action - do nothing
  } else {
    // Default action - focus on the app
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        if (clients.length > 0) {
          clients[0].focus();
        } else {
          self.clients.openWindow('/');
        }
      })
    );
  }
});

// Handle fetch events for offline support
self.addEventListener('fetch', (event) => {
  // Only handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(event.request);
        })
    );
  }
});
