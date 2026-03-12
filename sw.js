const CACHE = 'portfel-ts-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network first — zawsze świeża wersja, cache tylko jako fallback
self.addEventListener('fetch', e => {
  // API calls — tylko sieć
  if (e.request.url.includes('eodhd.com') ||
      e.request.url.includes('workers.dev') ||
      e.request.url.includes('financialmodelingprep') ||
      e.request.url.includes('fonts.googleapis')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', {status: 503})));
    return;
  }

  // HTML/JS/CSS — najpierw sieć, cache jako fallback offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
