# CarDash - Production-Ready Starter Project

A premium CarPlay-inspired in-car dashboard UI with Tesla/Apple aesthetic. Built with vanilla JavaScript, minimal dependencies, and optimized for landscape tablets in vehicles.

## 🎨 Features

- **Premium Aesthetic**: Minimalist, high-contrast UI with glass morphism effects
- **Smooth Animations**: Physics-driven transitions (200-400ms) with hardware-accelerated CSS transforms
- **Landscape-First**: Optimized for in-car tablets with large touch targets (84-120px)
- **4 Core Modules**:
  - 🗺️ **KARTAT** (Maps): MapLibre GL JS navigator with EMA smoothing
  - 🎵 **SPOTIFY**: Web Playback SDK integration
  - 💬 **TEKOÄLY** (AI): Telegram bot integration (@anomjugibot)
  - ⚙️ **ASETUKSET** (Settings): Brightness, volume, night mode, camera feed
- **PWA-Ready**: Service worker for offline support and fast loading
- **Accessibility**: ARIA labels, high contrast, keyboard navigation

## 🖼️ Background Image

**Background image path**: `/mnt/data/logotp.png`
**Fallback**: `/mnt/data/logotp.ico`

The background is referenced in `styles.css` at line ~70:
```css
background-image: url('/mnt/data/logotp.png');
/* Fallback: use url('/mnt/data/logotp.ico') if .png is missing */
```

## 🚀 Quick Start

### Local Testing (UI Only)

1. **Open directly in browser**:
   ```bash
   # Option 1: Double-click index.html
   # Option 2: Use simple HTTP server
   python3 -m http.server 8080
   # or
   npx serve .
   ```

2. **Access at**: `http://localhost:8080`

### Full Feature Testing (HTTPS Required for Spotify)

Some features require HTTPS:
- Spotify Web Playback SDK
- Geolocation API (optional, has fallback)
- Media Session API (works locally)

**Using ngrok**:
```bash
# Terminal 1: Start local server
python3 -m http.server 8080

# Terminal 2: Create HTTPS tunnel
ngrok http 8080
```

Access via the HTTPS URL provided by ngrok (e.g., `https://abc123.ngrok.io`)

**Using local TLS**:
```bash
# Create self-signed certificate
openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365

# Start HTTPS server (Node.js example)
npx http-server -S -C cert.pem -K key.pem -p 8443
```

## 📦 Project Structure

```
carplay-starter/
├── index.html          # Home screen with 2x2 app grid
├── maps.html           # Navigation with MapLibre GL JS
├── spotify.html        # Spotify Web Playback integration
├── telegram.html       # Telegram bot launcher (@anomjugibot)
├── settings.html       # Settings: brightness, volume, camera
├── styles.css          # Premium Tesla/Apple aesthetic
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline support & caching
└── readme.md           # This file
```

## 🔧 Configuration & Placeholders

### 1. Spotify Access Token

**File**: `spotify.html` (line ~150)

**Current**:
```javascript
const token = 'YOUR_SPOTIFY_ACCESS_TOKEN_HERE';
```

**Replace with**:
```javascript
const token = await fetch('/auth/token').then(r => r.text());
```

**Backend endpoint needed**:
- Implement OAuth 2.0 flow to get Spotify access token
- Token expires in 1 hour - implement refresh logic
- Requires Spotify Premium subscription

**Example backend (Node.js/Express)**:
```javascript
app.get('/auth/token', async (req, res) => {
  // Exchange refresh token for access token
  const accessToken = await spotifyApi.refreshAccessToken();
  res.send(accessToken.body.access_token);
});
```

### 2. Camera Stream URL

**File**: `settings.html` (line ~171)

**Current**:
```javascript
const STREAM_URL = 'STREAM_URL_PLACEHOLDER';
```

**Replace with your camera IP**:
```javascript
// MJPEG stream example
const STREAM_URL = 'http://192.168.1.100:8080/video?action=stream';

// HLS stream example
const STREAM_URL = 'http://192.168.1.100:8080/stream.m3u8';
```

**Supported formats**:
- MJPEG: URLs containing `?action=stream` or `mjpeg` → Uses `<img>`
- HLS: URLs ending with `.m3u8` → Uses `<video>` + HLS.js
- Generic: Other video URLs → Uses `<video>`

### 3. Map Routing API

**File**: `maps.html` (line ~67)

**Current**: Sample GeoJSON route

**Integration examples**:

**OSRM (Open Source)**:
```javascript
const response = await fetch(
  `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
);
const data = await response.json();
const route = data.routes[0].geometry;
```

**GraphHopper**:
```javascript
const response = await fetch(
  `https://graphhopper.com/api/1/route?point=${startLat},${startLng}&point=${endLat},${endLng}&vehicle=car&key=YOUR_API_KEY`
);
```

**Google Directions API**:
```javascript
const response = await fetch(
  `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&key=YOUR_API_KEY`
);
```

## 🗺️ Map Smoothing

**Current implementation**: Exponential Moving Average (EMA)
**Alpha value**: 0.2 (configurable in `maps.html`, line 47)

```javascript
const EMA_ALPHA = 0.2; // Lower = smoother but more lag (0.15-0.3 recommended)
```

**For production**: Consider implementing a **Kalman filter** for better noise reduction and prediction:

```javascript
// Kalman filter pseudocode
class KalmanFilter {
  constructor() {
    this.q = 0.1;  // Process noise
    this.r = 0.5;  // Measurement noise
    this.p = 1;    // Estimation error
    this.k = 0;    // Kalman gain
    this.x = 0;    // Estimated value
  }
  
  filter(measurement) {
    // Prediction
    this.p = this.p + this.q;
    
    // Update
    this.k = this.p / (this.p + this.r);
    this.x = this.x + this.k * (measurement - this.x);
    this.p = (1 - this.k) * this.p;
    
    return this.x;
  }
}
```

## 📱 PWA Installation

### Android

1. Open in Chrome/Edge
2. Tap menu → "Add to Home screen"
3. Launch from home screen for fullscreen experience

### iOS/iPadOS

1. Open in Safari
2. Tap Share → "Add to Home Screen"
3. Launch from home screen

### Desktop

1. Open in Chrome/Edge
2. Click install icon in address bar
3. Or: Menu → "Install CarDash..."

## 🎮 Kiosk Mode

For dedicated in-car tablets:

### Chrome/Edge (Desktop/Linux)
```bash
chrome --kiosk --app=http://localhost:8080/index.html
```

### Android
- Use **Kiosk Browser** app from Play Store
- Or configure **Android Enterprise** kiosk mode
- Or use **Samsung Knox** for lockdown

### Prevent Exit
Add to `index.html`:
```javascript
window.addEventListener('beforeunload', (e) => {
  e.preventDefault();
  e.returnValue = '';
});
```

## 🎨 Customization

### Color Scheme

Edit CSS variables in `styles.css` (lines 10-20):
```css
:root {
  --primary-bg: #000000;
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.2);
  --text-primary: #ffffff;
  --accent-blue: #1E90FF;
  --accent-green: #1ED760;
}
```

### Animation Timing

Adjust transition speeds:
```css
:root {
  --transition-fast: 220ms;
  --transition-medium: 320ms;
  --transition-slow: 400ms;
}
```

### Touch Target Sizes

For smaller screens, reduce button sizes in media queries (line ~480):
```css
@media (max-width: 768px) {
  .app-button {
    min-height: 140px;
  }
}
```

## 🔒 Security Notes

1. **HTTPS Required**: Spotify SDK and some browser APIs require secure origin
2. **Token Security**: Never commit access tokens to git
3. **CORS**: Backend must allow requests from your domain
4. **CSP**: Add Content Security Policy headers for production:
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; img-src 'self' data: https:; 
                  script-src 'self' https://unpkg.com https://sdk.scdn.co; 
                  style-src 'self' 'unsafe-inline' https://unpkg.com;">
   ```

## 🧪 Testing Checklist

- [ ] UI loads and displays correctly
- [ ] All 4 app buttons navigate to correct pages
- [ ] Back buttons return to home
- [ ] Smooth page transitions (no flicker)
- [ ] Night mode toggle works
- [ ] Brightness slider adjusts display
- [ ] Volume slider stores in localStorage
- [ ] Map loads and displays (demo tiles)
- [ ] Simulated route works (if geolocation denied)
- [ ] Spotify shows connection instructions
- [ ] Telegram opens web.telegram.org or deep link
- [ ] Settings persist after page reload
- [ ] PWA installs on home screen
- [ ] Service worker caches resources
- [ ] Offline mode shows cached pages

## 📚 Dependencies

- **MapLibre GL JS**: `v3.6.2` (CDN) - Map rendering
- **Spotify Web Playback SDK**: Latest (CDN) - Music playback
- **HLS.js**: Latest (CDN, optional) - HLS stream support

All dependencies loaded via CDN - no npm/package.json required.

## 🚀 Production Deployment

### Recommended Stack

- **Static Hosting**: Netlify, Vercel, GitHub Pages (for UI)
- **Backend**: Node.js, Python Flask, or serverless functions
- **Database**: For user preferences, favorites
- **CDN**: Cloudflare for global low-latency delivery

### Build Optimizations

1. **Minify CSS/JS**:
   ```bash
   npx terser service-worker.js -o service-worker.min.js
   npx clean-css-cli -o styles.min.css styles.css
   ```

2. **Image Optimization**:
   ```bash
   # Optimize background image
   pngquant logotp.png --quality=65-80 --output logotp-optimized.png
   ```

3. **Service Worker**: Consider using Workbox for advanced caching:
   ```javascript
   importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
   workbox.precaching.precacheAndRoute([...]);
   ```

## 📝 Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)
- ⚠️ Spotify SDK: Chrome/Edge only (Premium required)

## 🐛 Troubleshooting

### Spotify Won't Connect
- Ensure HTTPS (use ngrok)
- Check Premium subscription
- Verify token endpoint returns valid token
- Check browser console for errors

### Map Not Loading
- Check internet connection (tiles loaded from CDN)
- Verify MapLibre CDN accessible
- Check browser console for CORS errors

### Geolocation Not Working
- Grant location permission in browser
- HTTPS required for geolocation
- Fallback simulated route activates automatically

### Camera Feed Not Showing
- Verify `STREAM_URL` is correct and accessible
- Check camera is on same network
- Test stream URL directly in browser
- For HLS: Ensure HLS.js loads correctly

### Service Worker Issues
- Clear cache: DevTools → Application → Clear Storage
- Unregister: DevTools → Application → Service Workers → Unregister
- Hard reload: Ctrl+Shift+R (Cmd+Shift+R on Mac)

## 📄 License

This is a starter project. Customize and use freely for personal or commercial projects.

## 🙏 Acknowledgments

- Inspired by Tesla Model 3/Y interface
- Apple CarPlay design language
- MapLibre GL JS for beautiful maps
- Spotify for Web Playback SDK

## 📞 Support

For issues with:
- **Spotify Integration**: Check [Spotify Developer Docs](https://developer.spotify.com/documentation/web-playback-sdk/)
- **MapLibre**: Check [MapLibre Documentation](https://maplibre.org/maplibre-gl-js-docs/api/)
- **PWA**: Check [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

**Made with ❤️ for in-car experiences**
