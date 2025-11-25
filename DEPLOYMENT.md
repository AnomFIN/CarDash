# CarDash - Deployment Guide

Ohje CarDash-sovelluksen käyttöönottoon Android-tabletilla tai muilla laitteilla.

## Esivalmistelut

### 1. Logo-kuva

**Vaihtoehto A:** Käytä absoluuttista polkua (alkuperäinen)
- Lisää logo-kuva polkuun `/mnt/data/logotp.png`
- Varmista että palvelin voi käyttää tiedostoa

**Vaihtoehto B:** Käytä suhteellista polkua (suositeltu)
1. Luo `assets/`-kansio projektin juureen
2. Lisää logo-kuva: `assets/logotp.png`
3. Muokkaa `styles.css`, rivi 85:
   ```css
   background: url('assets/logotp.png') no-repeat center center;
   ```

### 2. PWA-ikonit

Luo PWA-ikonit sovellukselle:

```bash
cd icons/
# Käytä jotakin seuraavista tavoista (katso generate-icons.md):
# - Online-työkalu: https://www.pwabuilder.com/imageGenerator
# - ImageMagick
# - Node.js sharp-kirjasto
```

Tarvittavat koot: 72, 96, 128, 144, 152, 192, 384, 512 px

### 3. API-avaimet

**MapLibre:**
- Rekisteröidy: https://cloud.maptiler.com/ tai käytä muuta MapLibre-yhteensopivaa palvelua
- Kopioi API-avain

**Spotify:**
- Luo sovellus: https://developer.spotify.com/dashboard
- Aseta Redirect URI: `https://your-domain.com/callback`
- Kopioi Client ID ja Client Secret

## Paikallinen kehitys

### Python HTTP Server
```bash
cd CarDash
python3 -m http.server 8000
# Avaa: http://localhost:8000
```

### Node.js http-server
```bash
npm install -g http-server
http-server -p 8000
# Avaa: http://localhost:8000
```

### VS Code Live Server
1. Asenna Live Server -laajennus
2. Klikkaa "Go Live" oikeassa alakulmassa

## Tuotantoon vienti

### Vaihtoehto 1: Staattinen hosting (suositeltu)

**Netlify:**
```bash
# 1. Rekisteröidy: https://netlify.com
# 2. Asenna CLI
npm install -g netlify-cli

# 3. Kirjaudu
netlify login

# 4. Deploy
netlify deploy --prod
```

**Vercel:**
```bash
# 1. Rekisteröidy: https://vercel.com
# 2. Asenna CLI
npm install -g vercel

# 3. Deploy
vercel --prod
```

**GitHub Pages:**
```bash
# 1. Mene GitHub-repoon: Settings > Pages
# 2. Valitse branch: main/master
# 3. Tallenna
# URL: https://anomfin.github.io/CarDash/
```

### Vaihtoehto 2: Oma palvelin

**Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name cardash.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/cardash.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cardash.yourdomain.com/privkey.pem;
    
    root /var/www/cardash;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Service Worker cache headers
    location ~* ^/sw\.js$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires 0;
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Apache:**
```apache
<VirtualHost *:443>
    ServerName cardash.yourdomain.com
    DocumentRoot /var/www/cardash
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/cardash.yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/cardash.yourdomain.com/privkey.pem
    
    <Directory /var/www/cardash>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Service Worker no-cache
    <FilesMatch "sw\.js$">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
    </FilesMatch>
</VirtualHost>
```

### Vaihtoehto 3: Docker

Luo `Dockerfile`:
```dockerfile
FROM nginx:alpine

# Kopioi sovelluksen tiedostot
COPY . /usr/share/nginx/html

# Kopioi nginx-konfiguraatio
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Rakenna ja aja:
```bash
docker build -t cardash .
docker run -d -p 8080:80 cardash
```

## Android-tabletin asennus

### Vaihtoehto A: PWA-asennus

1. Avaa Chrome-selain Android-tabletissa
2. Navigoi CarDash-sovellukseen: `https://your-domain.com`
3. Klikkaa selaimen valikosta: "Lisää Koti-näyttöön" tai "Install app"
4. Sovellus toimii nyt itsenäisesti ilman selaimen UI:ta

### Vaihtoehto B: Kiosk-tila

**Fully Kiosk Browser (suositeltu):**
1. Asenna: https://play.google.com/store/apps/details?id=de.ozerov.fully
2. Avaa Fully Kiosk
3. Aseta Start URL: `https://your-domain.com`
4. Ota käyttöön:
   - Kiosk Mode
   - Keep Screen On
   - Auto-start on Boot
   - Disable Navigation Bar

**Chrome-kiosk:**
```bash
# ADB-komennot (vaatii Developer-tilan)
adb shell am start -n com.android.chrome/com.google.android.apps.chrome.Main \
  --es "url" "https://your-domain.com" \
  --ez "kiosk-mode" true
```

## SSL/HTTPS-varmenne

**Let's Encrypt (ilmainen):**
```bash
# Asenna Certbot
sudo apt-get update
sudo apt-get install certbot

# Luo varmenne (Nginx)
sudo certbot --nginx -d cardash.yourdomain.com

# Luo varmenne (Apache)
sudo certbot --apache -d cardash.yourdomain.com

# Automaattinen uusiminen
sudo certbot renew --dry-run
```

## Asetukset käyttöönoton jälkeen

1. Avaa sovellus
2. Navigoi Asetukset-sivulle
3. Syötä API-avaimet:
   - MapLibre API Token
   - Spotify Client ID
   - Spotify Client Secret
   - Stream URL (jos käytössä)
4. Säädä näyttöasetukset:
   - Kirkkaus
   - Yötila
5. Säädä navigointiasetukset:
   - Heading-up -tila
   - EMA Smoothing (suositus: 5-7)
6. Klikkaa "Tallenna asetukset"

## Vianmääritys

### Geolocation ei toimi
- Varmista että HTTPS on käytössä
- Myönnä sijaintilupa selaimessa
- Tarkista että GPS on päällä laitteessa

### Spotify ei toimi
- Varmista että HTTPS on käytössä
- Tarkista että sinulla on Premium-tili
- Tarkista Client ID ja Secret
- Varmista että Redirect URI on oikea Spotify Dashboardissa

### Service Worker ei rekisteröidy
- Varmista että HTTPS on käytössä (tai localhost)
- Tyhjennä selaimen välimuisti
- Tarkista konsoli-virheet

### Kartta ei lataudu
- Tarkista MapLibre API Token
- Tarkista että CDN-yhteys toimii
- Tarkista selaimen konsoli virheilmoituksia

### Logo ei näy
- Tarkista logo-kuvan polku `styles.css`:ssä
- Varmista että tiedosto on oikeassa paikassa
- Tarkista tiedoston käyttöoikeudet palvelimella

## Suorituskyvyn optimointi

1. **Pienennä tiedostoja:**
   ```bash
   # Asenna minifier
   npm install -g terser clean-css-cli html-minifier
   
   # Pienennä JS
   terser app.js -o app.min.js -c -m
   
   # Pienennä CSS
   cleancss -o styles.min.css styles.css
   
   # Päivitä viittaukset index.html:ssä
   ```

2. **Optimoi kuvat:**
   ```bash
   # Käytä imagemin tai squoosh.app
   npm install -g imagemin-cli
   imagemin icons/*.png --out-dir=icons/optimized
   ```

3. **Käytä CDN:ää:**
   - Siirrä staattiset tiedostot CDN:ään (esim. Cloudflare)
   - Päivitä viittaukset

4. **Käytä HTTP/2:**
   - Varmista että palvelin tukee HTTP/2
   - Nginx 1.9.5+ ja Apache 2.4.17+ tukevat

## Valvonta ja analytiikka

**Google Analytics:**
```html
<!-- Lisää index.html:n <head>-osioon -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Plausible (yksityisyysystävällinen):**
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/plausible.js"></script>
```

## Backup ja päivitykset

1. **Automaattinen backup:**
   ```bash
   # Cron job (päivittäin klo 2:00)
   0 2 * * * tar -czf /backup/cardash-$(date +\%Y\%m\%d).tar.gz /var/www/cardash
   ```

2. **Git-päivitykset:**
   ```bash
   cd /var/www/cardash
   git pull origin main
   sudo systemctl reload nginx
   ```

## Tuki ja dokumentaatio

- GitHub: https://github.com/AnomFIN/CarDash
- Issues: https://github.com/AnomFIN/CarDash/issues
- README: [README.md](README.md)

---

**Huom:** Tämä on starter-projekti. Tuotannossa varmista riittävä tietoturva, skaalautuvuus ja testaus.
