Copilot-ohjeet (miten Copilotin tulee toimia, checklist)

Generate files exactly with given filenames. Include placeholders and comments verbatim where server/back-end integration is needed.

Use the exact background path /mnt/data/logotp.png in CSS; include a visible fallback comment to /mnt/data/logotp.ico.

Style priority: visuals over feature-completeness — produce a polished, Tesla/Apple-like UI even if some features are stubbed. Smooth transitions and responsiveness are critical.

Maps: implement MapLibre demo with EMA smoothing, sample route GeoJSON, simulated fallback path; include comments with sample OSRM/GraphHopper request.

Spotify: scaffold Web Playback SDK with placeholder token fetch and device transfer snippet. Add Media Session API hooks.

Telegram: implement "open chat" button and fallback deep-link; do not implement TDLib.

PWA: add minimal manifest and service-worker with clear comments to upgrade for production (Workbox).

Accessibility: add role, aria-label, focus styles for all interactive elements.

Animations: implement CSS classes .page-enter, .page-exit and use requestAnimationFrame for map marker animation.

ZIP: after generating files, package into carplay-starter.zip.


# CarDash
Rakennetaan Teslan ja CarPlayn inspiroima selainpohjainen auto-UI Android-tablettiin. Etusivu käyttää logotp.png-taustaa ja tarjoaa neljä saumattomasti animoitua moduulia: navigointi, Spotify-soitin, tekoälychat sekä asetukset. Kokonaisuus on ultra-kevyt, responsiivinen ja reagoi kuin natiivisovellus.
