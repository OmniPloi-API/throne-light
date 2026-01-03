// Throne Light Reader - Service Worker
// Implements network-only strategy for book content with offline fallback

const CACHE_NAME = 'throne-light-reader-v3';
const SHELL_CACHE = 'throne-light-shell-v3';

// App shell files to cache (UI, styles, logos)
const SHELL_FILES = [
  '/reader/home',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/images/book-cover.jpg',
  '/images/THRONELIGHT-LOGO.png',
  '/images/THRONELIGHT-CROWN.png',
  '/images/Light-of-Eolles-Crown.png',
  '/offline.html'
];

// Install event - cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(SHELL_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== SHELL_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network-first for content, cache-first for shell
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // API calls and book content - NETWORK ONLY (security requirement)
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('/content/') ||
      url.pathname.includes('/book-data/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return offline response for API calls
          return new Response(
            JSON.stringify({ 
              error: 'offline', 
              message: 'Internet connection required to access book content' 
            }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Reader pages - Network first with offline fallback
  if (url.pathname.startsWith('/reader')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Try cache first, then offline page
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // Static assets - Cache first
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|woff|woff2|css|js)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(SHELL_CACHE).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            })
            .catch(() => new Response('', { status: 504 }));
        })
    );
    return;
  }

  // Default - Network first
  event.respondWith(
    fetch(event.request)
      .catch(() =>
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return new Response('Offline', { status: 504 });
        })
      )
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
