// src/lib/image-pipeline.js
import 'server-only';
import path from 'node:path';
import sharp from 'sharp';

export const ANCHOS = [400, 900, 1600];
export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGENES = 20;
const RATIO = 3 / 4;
const FUENTE = path.join(process.cwd(), 'src/assets/fonts/Montserrat-Bold.ttf');

/**
 * Tipo real por magic bytes (no se confía en el MIME ni en la extensión del navegador).
 * @param {Buffer} b
 * @returns {'jpeg' | 'png' | 'webp' | null}
 */
export function tipoReal(b) {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.toString('hex', 0, 8) === '89504e470d0a1a0a') return 'png';
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

/**
 * Procesa una imagen ya recortada: rota por EXIF, quita metadatos, fuerza 4:3 y genera 3 WebP + blur.
 * @param {Buffer} entrada
 * @returns {Promise<{ variantes: { ancho: number, alto: number, buffer: Buffer }[], blur: string }>}
 */
export async function procesarImagen(entrada) {
  /* rotate() aplica la orientación EXIF; sharp no copia metadatos (GPS incluido) salvo withMetadata */
  const base = sharp(entrada, { failOn: 'error', limitInputPixels: 80_000_000 }).rotate();
  const { width = 0 } = await base.clone().metadata();

  const variantes = await Promise.all(
    ANCHOS.map(async (ancho) => {
      const w = Math.min(ancho, Math.max(width, ANCHOS[0]));
      const h = Math.round(w * RATIO);
      const buffer = await base
        .clone()
        .resize(w, h, { fit: 'cover', position: 'centre', withoutEnlargement: false })
        .webp({ quality: 80, effort: 5 })
        .toBuffer();
      return { ancho: w, alto: h, buffer };
    }),
  );

  const mini = await base.clone().resize(10, 8, { fit: 'cover' }).webp({ quality: 50 }).toBuffer();
  return { variantes, blur: `data:image/webp;base64,${mini.toString('base64')}` };
}

const escaparPango = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Renderiza texto con la fuente incluida (no depende de fuentes del servidor). */
function texto(markup, puntos, ancho) {
  return sharp({
    text: {
      text: markup,
      font: `Montserrat Bold ${puntos}`,
      fontfile: FUENTE,
      rgba: true,
      width: ancho,
      wrap: 'word',
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
}

/**
 * Imagen OG 1200x630 (JPEG < 300 KB): portada + degradado azul + título + precio en píldora verde.
 * @param {{ portada: Buffer, titulo: string, precio: string }} datos
 */
export async function generarOg({ portada, titulo, precio }) {
  const W = 1200;
  const H = 630;
  const degradado = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.35" stop-color="#042369" stop-opacity="0"/><stop offset="1" stop-color="#042369" stop-opacity="0.92"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/><rect y="${H - 10}" width="${W}" height="10" fill="#27ae47"/></svg>`,
  );

  const t = titulo.length > 90 ? `${titulo.slice(0, 87)}…` : titulo;
  const [tituloImg, precioImg, marcaImg] = await Promise.all([
    texto(`<span foreground="#ffffff">${escaparPango(t)}</span>`, 34, W - 120),
    texto(`<span foreground="#042369">${escaparPango(precio)}</span>`, 30, W - 120),
    texto('<span foreground="#ffffff">PERCARA · NEGOCIOS INMOBILIARIOS</span>', 14, W - 120),
  ]);

  const pw = precioImg.info.width + 48;
  const ph = precioImg.info.height + 24;
  const pildora = Buffer.from(
    `<svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg"><rect width="${pw}" height="${ph}" rx="${ph / 2}" fill="#27ae47"/></svg>`,
  );

  const yTitulo = H - 60 - tituloImg.info.height;
  const yPrecio = yTitulo - 20 - ph;
  return sharp(portada)
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .composite([
      { input: degradado, top: 0, left: 0 },
      { input: marcaImg.data, top: 48, left: 60 },
      { input: pildora, top: yPrecio, left: 60 },
      { input: precioImg.data, top: yPrecio + 12, left: 84 },
      { input: tituloImg.data, top: yTitulo, left: 60 },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

/* RESUMEN
   Pipeline de imágenes con Sharp (solo servidor): tipoReal (magic bytes JPEG/PNG/WebP), procesarImagen
   (EXIF->rotación, sin metadatos, 4:3, WebP q80 en 400/900/1600 + blur 10px) y generarOg (1200x630 con
   degradado de marca, título y precio, fuente Montserrat incluida). Depende de: sharp, src/assets/fonts */
