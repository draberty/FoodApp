const CACHE_NAME = "meal-tracker-v1";

const ASSETS_TO_CACHE = [
	"index.html",
	"manifest.json",
	"assets/food-192.png",
	"assets/food-512.png",
	"CSS/styles.css",
	"Libs/pico.indigo.min.css",
	"Libs/dexie.min.js",
	"JS/db.js",
	"JS/main.js",
	"JS/AddMeals.js",
	"JS/chooseSides.js",
	"JS/inventoryManager.js",
	"JS/rendermeals.js",
];

// Install Event
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("[Service Worker] Caching core assets");
			return cache.addAll(ASSETS_TO_CACHE);
		}),
	);
	self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cache) => {
					if (cache !== CACHE_NAME) {
						console.log("[Service Worker] Deleting old cache:", cache);
						return caches.delete(cache);
					}
				}),
			);
		}),
	);
	self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") return;

	event.respondWith(
		caches
			.match(event.request, { ignoreSearch: true })
			.then((cachedResponse) => {
				const fetchPromise = fetch(event.request)
					.then((networkResponse) => {
						if (networkResponse && networkResponse.status === 200) {
							const responseClone = networkResponse.clone();
							caches.open(CACHE_NAME).then((cache) => {
								cache.put(event.request, responseClone);
							});
						}
						return networkResponse;
					})
					.catch(() => {});

				return cachedResponse || fetchPromise;
			}),
	);
});
