var CACHE_NAME = "housie_cache";
var urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./build/bundle.js",
  "./global.css",
  "./Images/icon.png",
  "./favicon.ico",
  "./postReq.php",
  "./housie.html"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
