// scripts/generate-og-default.mjs
// Uso (PowerShell): node scripts/generate-og-default.mjs
// Genera public/og-percara.jpg (1200x630) a partir de public/logo.png para las vistas previas del sitio.
import sharp from 'sharp';

const W = 1200;
const H = 630;
const LOGO_ANCHO = 960;
/* logo.png trae un borde oscuro de captura: se recorta antes de centrarlo */
const BORDE = { left: 10, top: 12, right: 12, bottom: 4 };

const meta = await sharp('public/logo.png').metadata();
const logo = await sharp('public/logo.png')
  .extract({
    left: BORDE.left,
    top: BORDE.top,
    width: meta.width - BORDE.left - BORDE.right,
    height: meta.height - BORDE.top - BORDE.bottom,
  })
  .flatten({ background: '#ffffff' })
  .trim({ background: '#ffffff', threshold: 20 })
  .resize({ width: LOGO_ANCHO })
  .toBuffer({ resolveWithObject: true });

const franja = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect y="${H - 14}" width="${W}" height="14" fill="#27ae47"/>
    <rect y="${H - 22}" width="${W}" height="8" fill="#042369"/>
  </svg>`,
);

await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
  .composite([
    {
      input: logo.data,
      left: Math.round((W - logo.info.width) / 2),
      top: Math.round((H - 22 - logo.info.height) / 2),
    },
    { input: franja, top: 0, left: 0 },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile('public/og-percara.jpg');

console.log('public/og-percara.jpg listo', logo.info.width, 'x', logo.info.height);

/* RESUMEN
   Script de una sola vez: recorta el borde de public/logo.png, lo centra en un lienzo blanco 1200x630 con
   franja azul y verde de marca y guarda public/og-percara.jpg (imagen de respaldo para compartir el sitio).
   Depende de: sharp, public/logo.png */
