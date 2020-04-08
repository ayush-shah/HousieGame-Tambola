var CACHE_NAME = 'housie_cache';
var urlsToCache = [
    "./",
    "./index.php",
    "./manifest.json",
    "./build/bundle.css",
    "./build/bundle.js",
    "./global.css",
    "./postReq.php",
    "./Images/icon.png"
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
    );
});
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});
