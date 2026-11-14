// scripts/generate-logo-header.mjs
// Uso (PowerShell): node scripts/generate-logo-header.mjs
// Genera public/logo-percara.webp: logo.png sin el borde de captura, recortado y con fondo transparente.
import sharp from 'sharp';

const ALTO = 128; // 2x+ del alto en pantalla (máx. ~56px)
/* logo.png trae un borde oscuro y una línea abajo: se recortan antes de quitar el blanco */
const BORDE = { left: 12, top: 14, right: 14, bottom: 10 };

const meta = await sharp('public/logo.png').metadata();
const { data, info } = await sharp('public/logo.png')
  .extract({
    left: BORDE.left,
    top: BORDE.top,
    width: meta.width - BORDE.left - BORDE.right,
    height: meta.height - BORDE.top - BORDE.bottom,
  })
  .flatten({ background: '#ffffff' })
  .trim({ background: '#ffffff', threshold: 20 })
  .resize({ height: ALTO })
  .raw()
  .toBuffer({ resolveWithObject: true });

/* Blanco -> transparente sin halos: alfa = cuánto se aleja del blanco y el color se "des-mezcla" del blanco */
const rgba = Buffer.alloc(info.width * info.height * 4);
for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  const lejania = 255 - Math.min(r, g, b);
  const a = lejania < 10 ? 0 : lejania; // el ruido casi blanco de la captura queda transparente
  const des = (c) => (a === 0 ? 0 : Math.round(255 - ((255 - c) * 255) / a));
  rgba[j] = des(r);
  rgba[j + 1] = des(g);
  rgba[j + 2] = des(b);
  rgba[j + 3] = a;
}

await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .webp({ quality: 85, alphaQuality: 85, effort: 6, smartSubsample: true })
  .toFile('public/logo-percara.webp');

console.log('public/logo-percara.webp listo', info.width, 'x', info.height);

/* RESUMEN
   Script de una sola vez: recorta el borde de public/logo.png, quita el fondo blanco (alfa sin halos),
   lo lleva a 128px de alto y guarda public/logo-percara.webp para el header.
   Depende de: sharp, public/logo.png */
