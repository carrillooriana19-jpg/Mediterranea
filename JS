// Service worker de "Mi Equipo". Es intencionalmente simple:
// solo guarda una copia de la página principal para que, si no hay
// conexión, se pueda abrir la app en vez de ver un error del navegador.
// Los datos (atletas, asistencia, eventos, etc.) siempre vienen de
// Firebase en tiempo real y necesitan conexión para actualizarse.

const CACHE_NAME = 'mi-equipo-v1';
const SHELL_URL = './mi-equipo-app.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(SHELL_URL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guardamos siempre la última versión de la página principal
        if (event.request.url.includes('mi-equipo-app.html')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(SHELL_URL, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match(SHELL_URL))
      )
  );
});
