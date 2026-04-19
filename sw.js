const CACHE_NAME = 'jeopardy-v2';
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
  './assets/js/game.js'
];

// ── Install: pre-cache all static assets ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: purge stale caches ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: network-only for API calls, cache-first for static ──
self.addEventListener('fetch', e => {
  // Always go network for Groq Worker API — never cache AI responses
  if (e.request.url.startsWith(WORKER_ORIGIN)) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Cache-first for all other requests
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request)
        .then(response => {
          // Dynamically cache new valid static responses
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        })
      )
  );
});
