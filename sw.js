const OFFLINE_VERSION = 1;
const CACHE_NAME = "trip-mosquito";
const OFFLINE_URL = "offline-design.html";
const OFFLINE_IMG = "images/offline.png";

self.addEventListener("install", function(event) {
    console.log("service worker installation");
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
            await cache.add(new Request(OFFLINE_IMG, { cache: "reload" }));
          })()
    );
    self.skipWaiting();
});
debugger;
self.addEventListener("activate", function(event) {
    console.log("service worker activation");
    event.waitUntil(
        (async () => {
            if ("navigationPreload" in self.registration) {
              await self.registration.navigationPreload.enable();
            }
          })()
    );
    self.clients.claim();
});
self.addEventListener("fetch", function(event) {
    if (event.request.mode === "navigate") {
        event.respondWith(
          (async () => {
              console.log(event)
            try {
              // First, try to use the navigation preload response if it's supported.
              const preloadResponse = await event.preloadResponse;
              if (preloadResponse) {
                return preloadResponse;
              }
    
              // Always try the network first.
              const networkResponse = await fetch(event.request);
              return networkResponse;
            } catch (error) {
              // catch is only triggered if an exception is thrown, which is likely
              // due to a network error.
              // If fetch() returns a valid HTTP response with a response code in
              // the 4xx or 5xx range, the catch() will NOT be called.
              console.log("Fetch failed; returning offline page instead.", error);
    
              const cache = await caches.open(CACHE_NAME);
              const cachedResponse = await cache.match(OFFLINE_URL);
              return cachedResponse;
            }
          })()
        );
      }
});