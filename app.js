/**
 * CarDash - Tesla-tyylinen CarPlay-starter
 * Pääsovelluslogiikka
 */

// ============================================
// Globaalit muuttujat
// ============================================

let currentScreen = 'main-menu';
let map = null;
let spotifyPlayer = null;
let currentPosition = null;
let currentHeading = 0;
let speedSmoothing = [];

// Asetukset (tallennetaan localStorage:en)
const settings = {
    maplibreToken: '',
    spotifyClientId: '',
    spotifyClientSecret: '',
    streamUrl: '',
    brightness: 80,
    nightMode: false,
    headingUp: true,
    smoothing: 5
};

// ============================================
// Alustus
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('CarDash käynnistyy...');
    
    // Lataa tallennetut asetukset
    loadSettings();
    
    // Alusta navigaatiopainikkeet
    initNavigation();
    
    // Alusta moduulit
    initMaps();
    initSpotify();
    initSettings();
    
    // Alusta geolocation
    initGeolocation();
    
    console.log('CarDash valmis!');
});

// ============================================
// Navigointi ruutujen välillä
// ============================================

function initNavigation() {
    // Päävalikon painikkeet
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const module = button.dataset.module;
            navigateTo(module + '-screen');
        });
    });
    
    // Takaisin-painikkeet
    const backButtons = document.querySelectorAll('.back-button');
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            navigateTo('main-menu');
        });
    });
}

function navigateTo(screenId) {
    // Piilota nykyinen ruutu
    const currentScreenEl = document.querySelector('.screen.active');
    if (currentScreenEl) {
        currentScreenEl.classList.remove('active');
    }
    
    // Näytä uusi ruutu
    const newScreen = document.getElementById(screenId);
    if (newScreen) {
        newScreen.classList.add('active');
        currentScreen = screenId;
        
        // Erityistoiminnot tietyille ruuduille
        if (screenId === 'maps-screen' && map) {
            map.resize();
        }
    }
}

// ============================================
// Kartat-moduuli: MapLibre + Geolocation
// ============================================

function initMaps() {
    console.log('Alustetaan karttamoduuli...');
    
    // Tarkista onko MapLibre ladattu
    if (typeof maplibregl === 'undefined') {
        console.error('MapLibre GL ei ole ladattu');
        return;
    }
    
    // Alusta kartta kun käyttäjä avaa karttanäkymän ensimmäisen kerran
    const mapsScreen = document.getElementById('maps-screen');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active') && !map) {
                createMap();
            }
        });
    });
    
    observer.observe(mapsScreen, { attributes: true, attributeFilter: ['class'] });
}

function createMap() {
    try {
        // Käytä OpenStreetMap-tyyliä oletuksena
        // Tuotannossa käytä settings.maplibreToken:ia
        map = new maplibregl.Map({
            container: 'map-container',
            style: 'https://demotiles.maplibre.org/style.json',
            center: [24.9384, 60.1699], // Helsinki oletuksena
            zoom: 14,
            pitch: 60, // 3D-näkymä
            bearing: 0
        });
        
        map.on('load', () => {
            console.log('Kartta ladattu');
            
            // Lisää käyttäjän sijaintimerkki
            const marker = new maplibregl.Marker({ color: '#3e7bfa' })
                .setLngLat([24.9384, 60.1699])
                .addTo(map);
            
            // Päivitä karttaa kun sijainti muuttuu
            if (currentPosition) {
                updateMapPosition(currentPosition);
            }
        });
        
        // Lisää zoom-kontrollit
        map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
        
    } catch (error) {
        console.error('Kartan luonti epäonnistui:', error);
    }
}

function updateMapPosition(position) {
    if (!map) return;
    
    const { latitude, longitude } = position.coords;
    
    // Päivitä kartan keskipiste
    map.setCenter([longitude, latitude]);
    
    // Heading-up -tila: käännä karttaa kompassin mukaan
    if (settings.headingUp && position.coords.heading !== null) {
        const smoothedHeading = smoothHeading(position.coords.heading);
        map.setBearing(smoothedHeading);
        
        // Päivitä kompassi UI:ssa
        updateCompass(smoothedHeading);
    }
    
    // Päivitä nopeus UI:ssa
    if (position.coords.speed !== null) {
        const speedKmh = Math.round(position.coords.speed * 3.6); // m/s -> km/h
        updateSpeedDisplay(speedKmh);
    }
}

/**
 * EMA (Exponential Moving Average) smoothing heading-arvoille
 * Vähentää tärinää ja äkilliset muutokset
 */
function smoothHeading(newHeading) {
    const alpha = settings.smoothing / 10; // 0-1 välillä
    
    // Huomioi 360° -> 0° siirtymä
    let delta = newHeading - currentHeading;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    
    currentHeading = currentHeading + alpha * delta;
    
    // Normalisoi 0-360 välille
    if (currentHeading < 0) currentHeading += 360;
    if (currentHeading >= 360) currentHeading -= 360;
    
    return currentHeading;
}

function updateSpeedDisplay(speed) {
    const speedValue = document.querySelector('.speed-value');
    if (speedValue) {
        speedValue.textContent = speed;
    }
}

function updateCompass(heading) {
    const needle = document.querySelector('.compass-needle');
    if (needle) {
        needle.style.transform = `translate(-50%, -100%) rotate(${heading}deg)`;
    }
}

// ============================================
// Geolocation: Jatkuva sijaintiseuranta
// ============================================

function initGeolocation() {
    if (!navigator.geolocation) {
        console.error('Geolocation ei ole tuettu');
        return;
    }
    
    // Pyydä jatkuvaa sijaintiseurantaa
    navigator.geolocation.watchPosition(
        (position) => {
            currentPosition = position;
            updateMapPosition(position);
        },
        (error) => {
            console.error('Sijaintia ei voitu hakea:', error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
}

// ============================================
// Spotify-moduuli: Web Playback SDK
// ============================================

function initSpotify() {
    console.log('Alustetaan Spotify-moduuli...');
    
    const loginButton = document.getElementById('spotify-login');
    loginButton.addEventListener('click', authenticateSpotify);
    
    // Kuuntele Spotify SDK:n valmistumista
    window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('Spotify Web Playback SDK valmis');
    };
}

function authenticateSpotify() {
    // HUOM: Tämä vaatii HTTPS-yhteyden ja Spotify Premium -tilin
    // Tuotannossa tarvitset oikean Client ID:n ja redirect URI:n
    
    if (!settings.spotifyClientId) {
        alert('Aseta Spotify Client ID asetuksista!');
        navigateTo('settings-screen');
        return;
    }
    
    const scopes = [
        'streaming',
        'user-read-email',
        'user-read-private',
        'user-read-playback-state',
        'user-modify-playback-state'
    ].join(' ');
    
    const redirectUri = window.location.origin + '/callback';
    const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${settings.spotifyClientId}&` +
        `response_type=token&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}`;
    
    // Avaa Spotify-kirjautuminen uudessa välilehdessä
    window.open(authUrl, '_blank');
}

function initSpotifyPlayer(accessToken) {
    // Luo Spotify Player -instanssi
    spotifyPlayer = new Spotify.Player({
        name: 'CarDash Player',
        getOAuthToken: cb => { cb(accessToken); },
        volume: 0.5
    });
    
    // Virhetilanteet
    spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('Spotify init error:', message);
    });
    
    spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('Spotify auth error:', message);
    });
    
    spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('Spotify account error:', message);
    });
    
    // Soittimen tilan muutokset
    spotifyPlayer.addListener('player_state_changed', state => {
        if (!state) return;
        
        updateSpotifyUI(state);
    });
    
    // Yhdistä soittimeen
    spotifyPlayer.connect().then(success => {
        if (success) {
            console.log('Spotify-soitin yhdistetty');
            // Näytä soitin, piilota kirjautumisviesti
            document.querySelector('.spotify-notice').classList.add('hidden');
            document.getElementById('spotify-player').classList.remove('hidden');
        }
    });
    
    // Soittimen kontrollit
    document.getElementById('play-pause-btn').addEventListener('click', () => {
        spotifyPlayer.togglePlay();
    });
    
    document.getElementById('prev-btn').addEventListener('click', () => {
        spotifyPlayer.previousTrack();
    });
    
    document.getElementById('next-btn').addEventListener('click', () => {
        spotifyPlayer.nextTrack();
    });
    
    document.getElementById('volume-slider').addEventListener('input', (e) => {
        spotifyPlayer.setVolume(e.target.value / 100);
    });
}

function updateSpotifyUI(state) {
    const { track_window, paused, position, duration } = state;
    const currentTrack = track_window.current_track;
    
    // Päivitä kappaleen tiedot
    document.getElementById('track-name').textContent = currentTrack.name;
    document.getElementById('artist-name').textContent = 
        currentTrack.artists.map(a => a.name).join(', ');
    document.getElementById('album-image').src = currentTrack.album.images[0].url;
    
    // Päivitä play/pause -painike
    const playBtn = document.getElementById('play-pause-btn');
    playBtn.textContent = paused ? '▶️' : '⏸️';
    
    // Päivitä edistymispalkki
    const progress = (position / duration) * 100;
    document.getElementById('progress').style.width = progress + '%';
}

// ============================================
// Asetukset-moduuli
// ============================================

function initSettings() {
    console.log('Alustetaan asetukset...');
    
    // Täytä asetuskenttien arvot
    document.getElementById('maplibre-token').value = settings.maplibreToken;
    document.getElementById('spotify-client-id').value = settings.spotifyClientId;
    document.getElementById('spotify-client-secret').value = settings.spotifyClientSecret;
    document.getElementById('stream-url').value = settings.streamUrl;
    document.getElementById('brightness').value = settings.brightness;
    document.getElementById('night-mode').checked = settings.nightMode;
    document.getElementById('heading-up').checked = settings.headingUp;
    document.getElementById('smoothing').value = settings.smoothing;
    
    // Tallenna-painike
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    // Yötila-vaihto
    document.getElementById('night-mode').addEventListener('change', (e) => {
        document.body.classList.toggle('night-mode', e.target.checked);
    });
    
    // Kirkkaus
    document.getElementById('brightness').addEventListener('input', (e) => {
        document.body.style.filter = `brightness(${e.target.value}%)`;
    });
}

function loadSettings() {
    const saved = localStorage.getItem('cardash-settings');
    if (saved) {
        Object.assign(settings, JSON.parse(saved));
        
        // Sovella yötila
        if (settings.nightMode) {
            document.body.classList.add('night-mode');
        }
        
        // Sovella kirkkaus
        document.body.style.filter = `brightness(${settings.brightness}%)`;
    }
}

function saveSettings() {
    // Lue arvot kentistä
    settings.maplibreToken = document.getElementById('maplibre-token').value;
    settings.spotifyClientId = document.getElementById('spotify-client-id').value;
    settings.spotifyClientSecret = document.getElementById('spotify-client-secret').value;
    settings.streamUrl = document.getElementById('stream-url').value;
    settings.brightness = parseInt(document.getElementById('brightness').value);
    settings.nightMode = document.getElementById('night-mode').checked;
    settings.headingUp = document.getElementById('heading-up').checked;
    settings.smoothing = parseInt(document.getElementById('smoothing').value);
    
    // Tallenna localStorage:en
    localStorage.setItem('cardash-settings', JSON.stringify(settings));
    
    // Näytä vahvistus
    const saveBtn = document.getElementById('save-settings');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '✓ Tallennettu!';
    setTimeout(() => {
        saveBtn.textContent = originalText;
    }, 2000);
    
    console.log('Asetukset tallennettu:', settings);
}

// ============================================
// Apufunktiot
// ============================================

/**
 * Tarkista onko HTTPS käytössä
 * (Vaaditaan Spotify Web Playback:lle ja monille geolocation-ominaisuuksille)
 */
function checkHTTPS() {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.warn('⚠️ HTTPS-yhteys suositellaan täyteen toiminnallisuuteen');
    }
}

checkHTTPS();

// ============================================
// Vie funktiot globaaliin scopeen tarvittaessa
// ============================================

window.CarDash = {
    navigateTo,
    settings,
    loadSettings,
    saveSettings
};
