const CACHE = 'portfel-ts-v1';
const ASSETS = [
  '/portfel-ts/',
  '/portfel-ts/index.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Dla zapytań API zawsze sieć
  if (e.request.url.includes('eodhd.com') || 
      e.request.url.includes('workers.dev') ||
      e.request.url.includes('fonts.googleapis')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', {status: 503})));
    return;
  }
  // Dla reszty — cache first, fallback network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
