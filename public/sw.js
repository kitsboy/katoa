const CACHE_NAME = 'katoa-static-v15';
const OFFLINE_URL = '/offline.html';

// caches.put() rejects on 206 Partial Content (range requests) — guard every put.
function cacheable(request, response) {
  if (!response || response.status !== 200) return false;
  if (request.headers.get('range')) return false;
  return true;
}

const PRECACHE = [
  OFFLINE_URL,
  '/logo2.png',
  '/logo2-192.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    /\.(js|css|png|jpg|jpeg|svg|webp|ico|woff2?)$/i.test(url.pathname)
  );
}

function isWishlistRoute(url) {
  return url.pathname.startsWith('/wishlist/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  const isAsset = isStaticAsset(url);
  const isWishlist = isWishlistRoute(url);

  if (!isNavigation && !isAsset && !isWishlist) return;

  if (isAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((response) => {
            if (cacheable(request, response)) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (cacheable(request, response)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (isNavigation || isWishlist) {
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
          return caches.match('/index.html');
        }
        return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});