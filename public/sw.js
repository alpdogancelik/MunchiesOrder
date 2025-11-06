// Minimal dev service worker to satisfy registration in index.html
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // take control immediately
    event.waitUntil(self.clients.claim());
});

// No caching in dev
self.addEventListener('fetch', () => { });
