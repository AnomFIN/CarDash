# Ikonien luominen

## Vaihtoehdot

### Vaihtoehto 1: Online-työkalut (helpoin)

1. **PWA Builder Image Generator**
   - Mene: https://www.pwabuilder.com/imageGenerator
   - Lataa `icon.svg` tai oma logosi
   - Lataa generoitu paketti
   - Kopioi PNG-tiedostot `icons/`-kansioon

2. **RealFaviconGenerator**
   - Mene: https://realfavicongenerator.net/
   - Lataa 512x512 PNG tai SVG
   - Valitse PWA-asetukset
   - Lataa paketti ja kopioi ikonit

### Vaihtoehto 2: ImageMagick (komentorivi)

Jos sinulla on ImageMagick asennettuna:

```bash
# Asenna ImageMagick (jos ei ole asennettu)
# Ubuntu/Debian: sudo apt-get install imagemagick
# macOS: brew install imagemagick
# Windows: chocolatey install imagemagick

# Luo ikonit SVG:stä
cd icons/
convert icon.svg -resize 72x72 icon-72.png
convert icon.svg -resize 96x96 icon-96.png
convert icon.svg -resize 128x128 icon-128.png
convert icon.svg -resize 144x144 icon-144.png
convert icon.svg -resize 152x152 icon-152.png
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 384x384 icon-384.png
convert icon.svg -resize 512x512 icon-512.png
```

### Vaihtoehto 3: Node.js script

Asenna sharp-kirjasto:
```bash
npm install sharp
```

Luo `generate-icons.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  for (const size of sizes) {
    await sharp('icon.svg')
      .resize(size, size)
      .png()
      .toFile(`icon-${size}.png`);
    console.log(`Generated icon-${size}.png`);
  }
}

generateIcons().catch(console.error);
```

Aja:
```bash
node generate-icons.js
```

### Vaihtoehto 4: Photoshop/GIMP/Inkscape

1. Avaa `icon.svg` haluamassasi ohjelmassa
2. Exportaa PNG-muodossa eri kokoisina
3. Nimeä tiedostot: `icon-72.png`, `icon-96.png`, jne.

## Huomautuksia

- Ikonien tulee olla **neliön muotoisia**
- Käytä **läpinäkyvää taustaa** tai **tasaväristä taustaa**
- Varmista että ikoni näkyy hyvin **pienessä koossa** (72x72)
- **Maskable**-ikonit voivat tarvita safe area -marginaalin
- Testaa eri laitteilla ja käyttöjärjestelmillä

## Tarkistuslista

- [ ] icon-72.png (72x72)
- [ ] icon-96.png (96x96)
- [ ] icon-128.png (128x128)
- [ ] icon-144.png (144x144)
- [ ] icon-152.png (152x152)
- [ ] icon-192.png (192x192)
- [ ] icon-384.png (384x384)
- [ ] icon-512.png (512x512)

## Placeholder-ikonit

Tällä hetkellä käytössä on SVG-placeholder. Kun oikeat PNG-ikonit on luotu, sovellus toimii täysin PWA:na.

Voit testata sovellusta ilman ikoneja - ne eivät ole pakollisia kehitysvaiheessa.
