const CACHE_NAME = 'todo-app-cache-v4';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icons/obrela-192x192.png',
  '/icons/obrela-512x512.png',
  '/favicon.ico'
];

// Install event: cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    }).then(() => self.skipWaiting())  // ΑΜΕΣΗ ενεργοποίηση
  );
});

// Activate event: καθαρισμός παλιών caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())  // ΑΜΕΣΟ takeover clients
  );
});

// Fetch event: serve from cache first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Αν βρήκαμε το αρχείο στην cache, το επιστρέφουμε
        if (response) {
          return response;
        }

        // Αλλιώς κάνουμε fetch και το βάζουμε στην cache
        return fetch(event.request).then(networkResponse => {
          // Μόνο GET αιτήματα, και μόνο ίδια origin
          if (
            !event.request.url.startsWith(self.location.origin) ||
            event.request.method !== 'GET'
          ) {
            return networkResponse;
          }

          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      }).catch(() => {
        // Optional: Εδώ μπορείς να επιστρέφεις offline.html ή fallback εικόνα
      })
  );
});
