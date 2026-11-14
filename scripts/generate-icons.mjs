// scripts/generate-icons.mjs
// Uso (PowerShell): node scripts/generate-icons.mjs   (después de generate-logo-header.mjs)
// Genera los íconos de la app a partir de la casita del logo (public/logo-percara.webp):
//   src/app/icon.png (192), src/app/apple-icon.png (180, iPhone), public/favicon.ico (16/32/48),
//   public/icons/icon-192.png, icon-512.png y icon-maskable-512.png (Android, manifest).
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

/* La casita ocupa el 40% izquierdo del logo; se recorta y se limpia el borde transparente */
const logo = await sharp('public/logo-percara.webp').metadata();
/* extract y trim en pasos separados: en un mismo pipeline sharp aplica el trim antes */
const recorte = await sharp('public/logo-percara.webp')
  .extract({ left: 0, top: 0, width: Math.round(logo.width * 0.4), height: logo.height })
  .png()
  .toBuffer();
const casa = await sharp(recorte).trim().png().toBuffer();

/**
 * Casita centrada sobre fondo blanco opaco (iOS y Android no muestran bien la transparencia).
 * @param {number} lado  px del cuadrado
 * @param {number} ocupa fracción del lado que ocupa la casita (más chico = más margen)
 */
async function icono(lado, ocupa) {
  const ancho = Math.round(lado * ocupa);
  const marca = await sharp(casa).resize({ width: ancho, height: ancho, fit: 'inside' }).toBuffer();
  return sharp({ create: { width: lado, height: lado, channels: 4, background: '#ffffff' } })
    .composite([{ input: marca, gravity: 'center' }])
    .flatten({ background: '#ffffff' })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toBuffer();
}

/** ICO con PNG embebidos (lo soportan todos los navegadores actuales). */
function ico(pngs) {
  const cab = Buffer.alloc(6 + 16 * pngs.length);
  cab.writeUInt16LE(0, 0);
  cab.writeUInt16LE(1, 2);
  cab.writeUInt16LE(pngs.length, 4);
  let offset = cab.length;
  pngs.forEach(({ lado, buf }, i) => {
    const e = 6 + i * 16;
    cab.writeUInt8(lado >= 256 ? 0 : lado, e);
    cab.writeUInt8(lado >= 256 ? 0 : lado, e + 1);
    cab.writeUInt16LE(1, e + 4);
    cab.writeUInt16LE(32, e + 6);
    cab.writeUInt32LE(buf.length, e + 8);
    cab.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  return Buffer.concat([cab, ...pngs.map((p) => p.buf)]);
}

await mkdir('public/icons', { recursive: true });
const salidas = [
  ['src/app/icon.png', 192, 0.84],
  ['src/app/apple-icon.png', 180, 0.72],
  ['public/icons/icon-192.png', 192, 0.84],
  ['public/icons/icon-512.png', 512, 0.84],
  /* Maskable: Android recorta en círculo; la marca va dentro de la zona segura (80%) */
  ['public/icons/icon-maskable-512.png', 512, 0.6],
];
for (const [ruta, lado, ocupa] of salidas) await writeFile(ruta, await icono(lado, ocupa));

const favs = await Promise.all(
  [16, 32, 48].map(async (lado) => ({ lado, buf: await icono(lado, 0.94) })),
);
await writeFile('public/favicon.ico', ico(favs));

console.log('Íconos listos:', [...salidas.map(([r]) => r), 'public/favicon.ico'].join(', '));

/* RESUMEN
   Script de una sola vez: recorta la casita de public/logo-percara.webp y genera los íconos de la app
   (favicon.ico, icon.png, apple-icon.png y los del manifest para Android, incluido el maskable).
   Depende de: sharp, public/logo-percara.webp */
