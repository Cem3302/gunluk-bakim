/* Günlük Bakım — Service Worker (çevrimdışı destek)
   Gezinmelerde önce ağ (her zaman güncel sürüm), çevrimdışıysa önbellek;
   diğer statik dosyalarda önce önbellek. */
const CACHE = 'gunluk-bakim-v3';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './gunluk-bakim-kaynak.zip'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.all(SHELL.map(url =>
        cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  /* gezinme + ZIP: önce ağ (her zaman güncel), çevrimdışıyken önbellek */
  const isZip = url.pathname.endsWith('.zip');
  if (req.mode === 'navigate' || isZip) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(req).then(m => m || (isZip ? Response.error() : caches.match('./index.html')))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(m => {
      if (m) return m;
      return fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
