const CACHE_NAME    = 'jeopardy-v2';
const WORKER_ORIGIN = 'https://groq-proxy.sshafiuddin-dev.workers.dev';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './assets/css/style.css',
  './assets/js/main.js',
  './assets/js/state.js',
  './assets/js/audio.js',
  './assets/js/timer.js',
  './assets/js/llm.js',
  './assets/js/render.js',
  './assets/js/game.js',
  './assets/js/register-sw.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Never cache AI / Worker API calls
  if (e.request.url.startsWith(WORKER_ORIGIN)) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Cache-first for all static assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(response => {
      if (response && response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }
      return response;
    }))
  );
});
