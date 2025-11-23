// CarDash Service Worker
// Provides offline support and fast loading for PWA functionality
// For production, consider using Workbox for advanced caching strategies

const CACHE_NAME = 'cardash-v1';
const RUNTIME_CACHE = 'cardash-runtime-v1';

// Files to precache (app shell)
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/maps.html',
    '/spotify.html',
    '/telegram.html',
    '/settings.html',
    '/styles.css',
    '/manifest.json',
    '/mnt/data/logotp.png'
];

// Install event - cache app shell
self.addEventListener('install', event => {
    console.log('[Service Worker] Install event');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Precaching app shell');
                // Use addAll with error handling for each resource
                return Promise.all(
                    PRECACHE_URLS.map(url => {
                        return cache.add(url).catch(err => {
                            console.warn(`[Service Worker] Failed to cache ${url}:`, err);
                            // Don't fail the whole installation if one resource fails
                            return Promise.resolve();
                        });
                    })
                );
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate event');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => {
                        // Delete old caches
                        return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
                    })
                    .map(cacheName => {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Handle different types of requests with appropriate strategies
    
    // 1. Map tiles and external resources - Network first, cache fallback
    if (isMapTile(request) || isExternalCDN(request)) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // 2. API requests - Network only (no caching)
    if (isAPIRequest(request)) {
        event.respondWith(fetch(request));
        return;
    }

    // 3. App shell and static assets - Cache first, network fallback
    event.respondWith(cacheFirstStrategy(request));
});

// Cache-first strategy (good for static assets)
async function cacheFirstStrategy(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', request.url);
        return cachedResponse;
    }
    
    console.log('[Service Worker] Fetching from network:', request.url);
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        
        // Return offline page or error response
        return new Response('Offline - resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

// Network-first strategy (good for dynamic content and map tiles)
async function networkFirstStrategy(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    
    try {
        console.log('[Service Worker] Network first for:', request.url);
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        console.error('[Service Worker] No cached response available');
        return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Helper: Check if request is for map tiles
function isMapTile(request) {
    const url = request.url;
    return url.includes('tile') || 
           url.includes('.pbf') || 
           url.includes('maplibre') ||
           url.includes('demotiles');
}

// Helper: Check if request is to external CDN
function isExternalCDN(request) {
    const url = request.url;
    return url.includes('unpkg.com') || 
           url.includes('cdn.jsdelivr.net') ||
           url.includes('sdk.scdn.co') ||
           url.includes('cloudflare');
}

// Helper: Check if request is an API call
function isAPIRequest(request) {
    const url = request.url;
    return url.includes('/api/') || 
           url.includes('/auth/') ||
           url.includes('spotify.com/api') ||
           url.includes('osrm') ||
           url.includes('graphhopper');
}

// Handle service worker messages (for future features)
self.addEventListener('message', event => {
    console.log('[Service Worker] Message received:', event.data);
    
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', event => {
    console.log('[Service Worker] Background sync:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Placeholder for background sync logic
    console.log('[Service Worker] Syncing data...');
}

// Push notifications (future enhancement)
self.addEventListener('push', event => {
    console.log('[Service Worker] Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/mnt/data/logotp.png',
        badge: '/mnt/data/logotp.png',
        vibrate: [200, 100, 200],
        tag: 'cardash-notification'
    };
    
    event.waitUntil(
        self.registration.showNotification('CarDash', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Note: For production use, consider using Workbox (https://developers.google.com/web/tools/workbox)
// Workbox provides advanced caching strategies, precaching, and runtime caching with minimal code:
//
// importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
//
// workbox.routing.registerRoute(
//   ({request}) => request.destination === 'image',
//   new workbox.strategies.CacheFirst()
// );
//
// workbox.precaching.precacheAndRoute([...]);
