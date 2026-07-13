// Service Worker — 六爻装卦 PWA 离线缓存
const CACHE_NAME = 'liuyao-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'app.js',
  'data.js',
  'zhuanggua.js',
  'ganzhi.js',
  'manifest.json',
  'data/hexagrams.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
    ))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
