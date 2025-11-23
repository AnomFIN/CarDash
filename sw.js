/**
 * CarDash Service Worker
 * Mahdollistaa offline-käytön ja nopean latauksen (PWA)
 */

const CACHE_NAME = 'cardash-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

// Asenna Service Worker ja tallenna staattiset tiedostot välimuistiin
self.addEventListener('install', (event) => {
    console.log('[SW] Asennetaan Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Tallennetaan tiedostoja välimuistiin');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((error) => {
                console.error('[SW] Välimuistin luonti epäonnistui:', error);
            })
    );
    
    // Aktivoi uusi service worker heti
    self.skipWaiting();
});

// Aktivoi Service Worker ja poista vanhat välimuistit
self.addEventListener('activate', (event) => {
    console.log('[SW] Aktivoidaan Service Worker...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Poistetaan vanha välimuisti:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Ota service worker heti käyttöön kaikissa asiakkaissa
    return self.clients.claim();
});

// Kuuntele fetch-pyyntöjä ja palauta välimuistista jos mahdollista
self.addEventListener('fetch', (event) => {
    // Ohita ei-GET-pyynnöt ja ulkoiset API-kutsut
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Älä välimuistita Spotify tai muiden palveluiden API-kutsuja
    // Käytetään URL-objektia turvalliseen hostinimen tarkistukseen
    try {
        const url = new URL(event.request.url);
        const hostname = url.hostname;
        
        // Tarkista että hostname päättyy oikeaan domainiin (estää subdomain-hyökkäykset)
        if (hostname.endsWith('.spotify.com') || hostname === 'spotify.com' ||
            hostname.endsWith('.telegram.org') || hostname === 'telegram.org' ||
            hostname.endsWith('.maplibre.org') || hostname === 'maplibre.org' ||
            hostname.endsWith('.unpkg.com') || hostname === 'unpkg.com') {
            return;
        }
    } catch (e) {
        // Jos URL-parsinta epäonnistuu, jatka normaalisti
        console.warn('[SW] URL-parsinta epäonnistui:', e);
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Palauta välimuistista jos löytyy
                if (response) {
                    console.log('[SW] Palautetaan välimuistista:', event.request.url);
                    return response;
                }
                
                // Muuten hae verkosta
                return fetch(event.request)
                    .then((response) => {
                        // Tarkista että vastaus on validi
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Kloonaa vastaus välimuistia varten
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('[SW] Fetch epäonnistui:', error);
                        
                        // Jos offline ja pyyntö on HTML-sivu, palauta index.html
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Kuuntele viestejä sovelluslogiikasta
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker ladattu');
