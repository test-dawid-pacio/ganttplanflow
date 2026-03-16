// ============================================================
//  GanttPlanFlow — Service Worker (PWA offline)
//  Wersja cache: zmień CACHE_VERSION przy każdej aktualizacji
// ============================================================

const CACHE_VERSION = 'gpf-v1.0.0';

// Pliki lokalne — cachowane od razu przy instalacji
const LOCAL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Zewnętrzne zasoby CDN — cachowane przy pierwszym załadowaniu
const CDN_FILES = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js@4',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=IBM+Plex+Mono:wght@400;500&display=swap'
];

// ── INSTALL ─────────────────────────────────────────────────
// Cachuje pliki lokalne + CDN przy pierwszej wizycie
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      // Najpierw pliki lokalne (muszą się udać)
      await cache.addAll(LOCAL_FILES);

      // Potem CDN (próbujemy, ale nie blokujemy instalacji)
      for (const url of CDN_FILES) {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (err) {
          console.warn('[SW] Nie udało się zcachować:', url, err);
        }
      }
    })
  );
  // Aktywuj od razu, nie czekaj na zamknięcie starych kart
  self.skipWaiting();
});

// ── ACTIVATE ────────────────────────────────────────────────
// Usuwa stare wersje cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Przejmij kontrolę nad otwartymi kartami
  self.clients.claim();
});

// ── FETCH ───────────────────────────────────────────────────
// Strategia: Cache-First (szukaj w cache, potem sieć)
// Dla fontów Google: cachuj dynamicznie (pliki .woff2 ładują się leniwie)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignoruj non-GET requesty
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Cachuj dynamicznie fonty Google i inne zasoby
          if (
            networkResponse.ok &&
            (url.hostname.includes('fonts.googleapis.com') ||
             url.hostname.includes('fonts.gstatic.com') ||
             url.hostname.includes('cdn.jsdelivr.net') ||
             url.hostname.includes('cdn.tailwindcss.com'))
          ) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(event.request, cloned);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback — dla nawigacji zwróć index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
