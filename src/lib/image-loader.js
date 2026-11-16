// src/lib/image-loader.js

const VARIANTES = [400, 900, 1600];
/* Una variante sirve hasta 1,35x su ancho: en celulares de alta densidad (pide 1080-1200 px para una
   foto de ~390 px) la de 900 se ve igual de nítida y pesa ~65 % menos que la de 1600. */
const TOLERANCIA = 1.35;

/**
 * Loader de next/image: las fotos de R2 ya están pregeneradas (400/900/1600 WebP), así que se elige la
 * variante más chica que cubra el ancho pedido, sin pasar por el optimizador de Next.
 * El resto (archivos locales) se sirve tal cual.
 * @param {{ src: string, width: number }} p
 */
export default function cargadorImagenes({ src, width }) {
  const m = src.match(/^(.*)-1600\.webp$/);
  if (m) {
    const w = VARIANTES.find((v) => v * TOLERANCIA >= width) ?? VARIANTES[VARIANTES.length - 1];
    return `${m[1]}-${w}.webp`;
  }
  return `${src}${src.includes('?') ? '&' : '?'}w=${width}`;
}

/* RESUMEN
   Loader global de next/image (loaderFile en next.config.mjs): para URLs "*-1600.webp" de R2 devuelve la
   variante 400/900/1600 adecuada al ancho (con tolerancia 1,35x para ahorrar datos en celulares); para archivos locales agrega ?w= y los sirve sin procesar.
   Depende de: nada */
