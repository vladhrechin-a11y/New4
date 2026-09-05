const CACHE_NAME = 'pidtrymka-v14';

const BASE = self.registration.scope;

const APP_SHELL = [
  "",
  "index.html",
  "app.html",
  "manifest.json",
  "offline-data.js",
  "service-worker.js",
  "icon-192.png",
  "icon-512.png",
  "app-icon.png",
  "p_1_2.webp",
  "p_2_2_1.webp",
  "p_2_2_2.webp",
  "p_3_1.webp",
  "p_4_1.webp",
  "p_5_1.webp",
  "G-1.1.webp",
  "G-1.2.webp",
  "G-2.1.webp",
  "G-2.2.webp",
  "G-2.3.webp",
  "G-2.4.webp",
  "G-2.5.webp",
  "G-3.1.webp",
  "G-3.2-1.webp",
  "G-3.2.webp",
  "G-3.3.webp",
  "G-3.4.webp",
  "G-4.1.webp",
  "G-4.2.webp",
  "G-4.3.webp",
  "G-4.4.webp",
  "G-5.1.webp",
  "G-6.1.webp",
  "G-6.2.webp",
  "G-6.3.webp",
  "G-6.4.webp",
  "G-7.1.webp",
  "G-7.2.webp",
  "G-7.3.webp",
  "G-7.4.webp",
  "G-7.5.webp",
  "Y-2.2.webp",
  "Y-2.3.webp",
  "Y-2.4.webp",
  "Y-3.1.webp",
  "Y-5.1.webp",
  "Y-5.3.webp"
].map(path => new URL(path, BASE).href);


self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL);
      await self.skipWaiting();
    })()
  );
});


self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});


self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  const isHTML =
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html');

  if (isHTML) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
          const response = await fetch(event.request);

          if (response.ok) {
            await cache.put(event.request, response.clone());
          }

          return response;
        } catch (_) {
          const cached = await cache.match(event.request);

          if (cached) {
            return cached;
          }

          return cache.match(
            new URL('app.html', BASE).href
          );
        }
      })()
    );

    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      const cached = await cache.match(event.request);

      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(event.request);

        if (response.ok) {
          await cache.put(event.request, response.clone());
        }

        return response;
      } catch (_) {
        return new Response('', {
          status: 503
        });
      }
    })()
  );
});
