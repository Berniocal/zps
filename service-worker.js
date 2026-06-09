// 🔥 ZMĚŇ vždy při update aplikace
const CACHE_VERSION = "v20";

// název cache
const CACHE_NAME = "playlist-app-" + CACHE_VERSION;

// základní soubory aplikace
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./bible-loader.js",
  "./word-dict.min.json",
  "./bible/CSP/index.json"
];

// načte seznam všech kapitol Bible podle bible/CSP/index.json
async function getBibleAssets() {
  try {
    const res = await fetch("./bible/CSP/index.json", { cache: "no-store" });

    if (!res.ok) {
      throw new Error("Nepodařilo se načíst bible/CSP/index.json");
    }

    const index = await res.json();
    const files = [];

    for (const book of index.books || []) {
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        files.push(`./bible/CSP/${book.code}/${chapter}.json`);
      }
    }

    return files;
  } catch (err) {
    console.warn("Nepodařilo se připravit seznam biblických souborů:", err);
    return [];
  }
}

// instalace
self.addEventListener("install", event => {
  console.log("SW install", CACHE_VERSION);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // nejdřív základ aplikace
      await cache.addAll(CORE_ASSETS);

      // potom celá Bible
      const bibleAssets = await getBibleAssets();

      for (const file of bibleAssets) {
        try {
          await cache.add(file);
        } catch (err) {
          console.warn("Nepodařilo se uložit do cache:", file, err);
        }
      }
    })()
  );

  self.skipWaiting();
});

// aktivace
self.addEventListener("activate", event => {
  console.log("SW activate", CACHE_VERSION);

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// cache first
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
