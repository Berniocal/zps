// 🔥 ZMĚŇ vždy při update aplikace
const CACHE_VERSION = "v10";

// název cache
const CACHE_NAME = "playlist-app-" + CACHE_VERSION;

// co se má cachovat
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
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

// fetch (cache first)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
