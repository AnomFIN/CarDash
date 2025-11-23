# CarDash 🚗

Minimalistinen, Tesla-tyylinen CarPlay-starter Android-tablettiin. Ultra-kevyt, responsiivinen selainpohjainen auto-UI joka reagoi kuin natiivisovellus.

![CarDash](https://img.shields.io/badge/PWA-Compatible-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Ominaisuudet

### 🏠 Päävalikko
- Logo taustalla (`/mnt/data/logotp.png`)
- 2×2 grid isoilla, kosketusystävällisillä painikkeilla
- Sulava animaatio ja Tesla-tyylinen minimalismi

### 🗺️ Kartat-moduuli
- **MapLibre GL** -navigaattori
- **Heading-up** -tila (kartta kääntyy kompassin mukaan)
- **EMA (Exponential Moving Average) smoothing** tärinän vähentämiseen
- Reaaliaikainen nopeusnäyttö
- 3D-karttanäkymä (pitch 60°)
- Kompassi heading-indikaattorilla

### 🎵 Spotify-moduuli
- **Spotify Web Playback SDK** -integraatio
- Album art, kappaletiedot ja artistit
- Toisto-kontrollit (play/pause, previous, next)
- Äänenvoimakkuuden säätö
- Edistymispalkki
- ⚠️ Vaatii: HTTPS-yhteys ja Spotify Premium -tili

### 🤖 Tekoäly-moduuli
- Linkki Telegram-bottiin: **@anomjugibot**
- Suora integraatio Telegram-keskusteluun
- Listatut ominaisuudet:
  - Ääniohjaus
  - Sijaintitiedot
  - Ajoneuvoinfo
  - Reaaliaikainen chat

### ⚙️ Asetukset-moduuli
- **API-asetukset:**
  - MapLibre API Token
  - Spotify Client ID & Secret
  - Stream URL
- **Näyttöasetukset:**
  - Kirkkaussäädin
  - Yötila (dark mode)
- **Navigointiasetukset:**
  - Heading-up -tilan toggle
  - EMA smoothing -tason säätö (0-10)
- Asetukset tallennetaan `localStorage`:en

## 🚀 Asennus ja käyttö

### 1. Kloonaa repositorio
```bash
git clone https://github.com/AnomFIN/CarDash.git
cd CarDash
```

### 2. Lisää tarvittavat tiedostot

#### Logo-kuva
Lisää logo-kuva polkuun `/mnt/data/logotp.png` tai päivitä polku `styles.css`-tiedostossa:
```css
.logo-background {
    background: url('path/to/your/logo.png') no-repeat center center;
}
```

#### PWA-ikonit
Luo ikonit eri kokoisina ja lisää ne `icons/`-kansioon. Katso `icons/README.md` ohjeita varten.

### 3. Käynnistä kehityspalvelin

Käytä mitä tahansa staattista palvelinta, esim:

**Python:**
```bash
python -m http.server 8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

**VS Code Live Server:**
Asenna Live Server -laajennus ja klikkaa "Go Live"

### 4. Avaa selaimessa
```
http://localhost:8000
```

### 5. Asenna PWA:na (valinnainen)
- Avaa sovellus selaimessa
- Klikkaa selaimen valikosta "Asenna sovellus" tai "Add to Home Screen"
- Sovellus toimii nyt itsenäisesti ilman selaimen UI:ta

## 🔧 Konfigurointi

### API-avaimet ja tokenit

1. **MapLibre Token:**
   - Rekisteröidy MapLibre-palveluun tai käytä vaihtoehtoista karttapalvelua
   - Lisää token Asetukset-sivulla

2. **Spotify API:**
   - Luo sovellus [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Kopioi Client ID ja Client Secret
   - Lisää redirect URI: `https://yourapp.com/callback`
   - Aseta tokenit Asetukset-sivulla

3. **Stream URL:**
   - Lisää mahdollinen stream-URL Asetukset-sivulle

### HTTPS-vaatimus
Monet ominaisuudet vaativat HTTPS-yhteyden:
- Geolocation (heading, speed)
- Spotify Web Playback
- Service Worker (PWA)

**Kehityksessä:** `localhost` toimii ilman HTTPS:ää

**Tuotannossa:** Käytä SSL-sertifikaattia (esim. Let's Encrypt)

## 📱 Laitteistosuositukset

- **Android-tabletti** (suositeltu: 7-10 tuumaa)
- **Näytön resoluutio:** 1280x720 tai parempi
- **Landscape-orientaatio** (vaakakäyttö)
- **Internet-yhteys:** WiFi tai mobiilidata
- **GPS:** Navigointia varten

## 🎨 Räätälöinti

### Värit ja teemat
Muokkaa CSS-muuttujia `styles.css`-tiedostossa:
```css
:root {
    --bg-dark: #000000;
    --accent-color: #3e7bfa;
    --success-color: #1db954;
    /* ... */
}
```

### Moduulien lisääminen
1. Lisää painike `index.html`:n `.button-grid`:iin
2. Luo uusi `.screen`-elementti
3. Lisää logiikka `app.js`:ään

## 📂 Projektin rakenne

```
CarDash/
├── index.html          # Pääsivu
├── styles.css          # Tyylit
├── app.js              # Sovelluslogiikka
├── manifest.json       # PWA-manifesti
├── sw.js               # Service Worker
├── icons/              # PWA-ikonit
│   └── README.md
└── README.md           # Tämä tiedosto
```

## 🛠️ Teknologiat

- **HTML5** - Semanttinen rakenne
- **CSS3** - Grid, Flexbox, Custom Properties, Animations
- **Vanilla JavaScript** - Ei riippuvuuksia frameworkeista
- **MapLibre GL JS** - Karttanäkymä ja navigointi
- **Spotify Web Playback SDK** - Musiikkisoitin
- **Geolocation API** - Sijaintiseuranta
- **Service Worker** - Offline-tuki ja PWA
- **LocalStorage** - Asetusten tallennus

## 🔒 Turvallisuus

- **Älä commitoi API-avaimia** - Käytä ympäristömuuttujia tai asetussivua
- **HTTPS pakollinen tuotannossa** - Suojaa käyttäjätiedot
- **Content Security Policy** - Harkitse CSP-headerien lisäämistä
- **Input-validointi** - Validoi käyttäjän syötteet

## 🐛 Tunnetut rajoitukset

1. **Logo-kuva:** Polku `/mnt/data/logotp.png` voi vaatia muokkauksen
2. **PWA-ikonit:** Placeholder-ikonit, korvaa oikeilla ikoneilla
3. **Spotify-callback:** Vaatii backend-toteutuksen tuotannossa
4. **MapLibre-tyyli:** Käyttää demo-tyyliä, vaihda omaan tyyliin

## 📝 Tehtävälista

- [ ] Lisää oikeat PWA-ikonit
- [ ] Implementoi Spotify OAuth callback
- [ ] Lisää backend token-hallintaa varten
- [ ] Optimoi MapLibre-kartan suorituskyky
- [ ] Lisää offline-karttatuki
- [ ] Implementoi unit-testit
- [ ] Lisää accessibility-ominaisuuksia (ARIA)
- [ ] Lisää screenshot-gallerial

## 🤝 Kontribuutiot

Pull requestit ovat tervetulleita! Isommille muutoksille, avaa ensin issue keskustellaksesi muutoksista.

## 📄 Lisenssi

MIT License - Katso LICENSE-tiedosto lisätietoja varten

## 👤 Tekijä

**AnomFIN**

## 🙏 Kiitokset

- Tesla - UI-inspiraatio
- MapLibre - Avoimen lähdekoodin karttaratkaisu
- Spotify - Web Playback SDK
- Telegram - Bot API

---

**Huom:** Tämä on starter-projekti. Käytä tuotannossa asianmukaista backend-infraa, tietoturvaa ja testeja.
