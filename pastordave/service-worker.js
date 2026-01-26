/**
 * Pastor Dave Service Worker
 * Provides offline support and caching for the PWA
 */

const CACHE_NAME = 'pastor-dave-v1';
const urlsToCache = [
  './',
  './pastor-dave.html',
  'https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Open+Sans:wght@300;400;600&display=swap',
  'https://cdn.jsdelivr.net/npm/@elevenlabs/client/dist/lib.umd.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first strategy for API calls and ElevenLabs endpoints
  if (url.hostname.includes('api.elevenlabs.io') ||
      url.hostname.includes('elevenlabs.io') ||
      request.method !== 'GET') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({
              error: 'offline',
              message: 'You are currently offline. Please check your internet connection.'
            }),
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', request.url);
          return cachedResponse;
        }

        console.log('[Service Worker] Fetching from network:', request.url);
        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched resource
            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache same-origin or CORS-enabled resources
                if (url.origin === location.origin ||
                    url.hostname.includes('googleapis.com') ||
                    url.hostname.includes('gstatic.com') ||
                    url.hostname.includes('jsdelivr.net')) {
                  cache.put(request, responseToCache);
                }
              });

            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);

            // Return offline fallback for HTML pages
            if (request.headers.get('Accept').includes('text/html')) {
              return caches.match('./pastor-dave.html');
            }

            // Return offline response for other requests
            return new Response('Offline - Resource not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Handle messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline messages (future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-messages') {
    console.log('[Service Worker] Background sync triggered');
    // Future: Sync offline messages when connection is restored
  }
});

// Push notifications (future enhancement)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: 'icon-192x192.png',
      badge: 'icon-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'pastor-dave-notification',
      requireInteraction: false
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});
