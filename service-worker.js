// 🔥 ZMĚŇ vždy při update aplikace
const CACHE_VERSION = "v11";

// název cache
const CACHE_NAME = "playlist-app-" + CACHE_VERSION;

// co se má cachovat
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// instalace
self.addEventListener("install", event => {
  console.log("SW install", CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );

  self.skipWaiting(); // 🔥 okamžitá aktivace
});

// aktivace (vyčištění starých verzí)
self.addEventListener("activate", event => {
  console.log("SW activate", CACHE_VERSION);

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim(); // 🔥 převezme kontrolu hned
});

self.addEventListener("fetch", event => {

  // pro HTML vždy nejdřív server
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ostatní soubory klidně cache-first
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
