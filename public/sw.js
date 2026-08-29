self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network first to ensure all instant updates deploy immediately
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
