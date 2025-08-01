// Versionsnummer des Caches, um Aktualisierungen zu ermöglichen
const CACHE_NAME = 'schwingenschlag-score-v1';

// Liste der Dateien, die gecacht werden sollen
const urlsToCache = [
  '/',
  '/index.html',
  '/img/Leer.png',
  '/img/Voll.png',
  '/img/Flagge.png',
  '/img/Symbole.png'
  // Wenn du eigene Icons hast, füge sie hier ebenfalls hinzu
  // '/img/icon-192x192.png',
  // '/img/icon-512x512.png'
];

// Installation des Service Workers und Cachen der Dateien
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
  );
});

// Abfangen von Fetch-Anfragen und Bereitstellen aus dem Cache (falls vorhanden)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache-Treffer: Die gecachte Ressource zurückgeben
        if (response) {
          return response;
        }

        // Kein Cache-Treffer: Die Anfrage vom Netzwerk abrufen
        return fetch(event.request).then(
          networkResponse => {
            // Überprüfen, ob wir eine gültige Antwort erhalten haben
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Klonen der Antwort, da ein Response-Stream nur einmal gelesen werden kann
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});

// Aktivierung des Service Workers und Löschen alter Caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

