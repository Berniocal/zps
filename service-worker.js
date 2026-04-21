self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('playlist-app').then(cache => {
      return cache.addAll(['./', './index.html']);
    })
  );
});
