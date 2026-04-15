const CACHE_NAME = 'phoenix-cache-v1';

// Dateien, die sofort beim ersten Laden da sein MÜSSEN (Core)
const PRE_CACHE = [
  '/',
  '/index.html',
  '/style.css'
];

// 1. Installation: Wichtige Dateien direkt speichern
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE);
    })
  );
  // Aktiviert den SW sofort, ohne auf das Schließen des Tabs zu warten
  self.skipWaiting();
});

// 2. Aktivierung: Alten Müll aufräumen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Lösche alten Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Das Herzstück: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      
      // Starte die Netzwerk-Anfrage parallel
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Nur gültige Antworten cachen (nicht von anderen Seiten/APIs)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Optional: Hier könnte man eine Offline-Seite anzeigen
      });

      // Gib die Cache-Antwort sofort zurück (falls vorhanden), 
      // ansonsten warte auf das Netzwerk
      return cachedResponse || fetchPromise;
    })
  );
});
