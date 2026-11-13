// src/lib/format.js

const NUM = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

/**
 * "USD 120.000" / "$ 85.000.000" / "Consultar precio".
 * @param {number | null} precio
 * @param {'ARS' | 'USD'} moneda
 */
export function formatPrecio(precio, moneda) {
  if (precio === null || precio === undefined || precio <= 0) return 'Consultar precio';
  return `${moneda === 'USD' ? 'USD' : '$'} ${NUM.format(precio)}`;
}

/**
 * Precio para el público: respeta `mostrar_precio` (si es false, "Consultar precio").
 * @param {{ precio: number | null, moneda: 'ARS' | 'USD', mostrar_precio?: boolean }} p
 */
export function precioPublico(p) {
  return p.mostrar_precio === false ? 'Consultar precio' : formatPrecio(p.precio, p.moneda);
}

/**
 * Superficie con unidad adecuada: m² hasta 9.999, hectáreas desde 10.000 m².
 * @param {number | null} m2
 */
export function formatSuperficie(m2) {
  if (!m2) return null;
  if (m2 >= 10000) {
    const ha = m2 / 10000;
    return `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(ha)} ha`;
  }
  return `${NUM.format(m2)} m²`;
}

/** @param {number} n @param {string} singular @param {string} plural */
export function plural(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}

/**
 * Datos cortos y homogéneos para cards, metadata y alt: superficie, dormitorios, baños, ubicación.
 * @param {import('@/types').Propiedad} p
 * @returns {string[]}
 */
export function datosClave(p) {
  return [
    formatSuperficie(p.superficie_total),
    p.dormitorios ? plural(p.dormitorios, 'dormitorio', 'dormitorios') : null,
    p.banos ? plural(p.banos, 'baño', 'baños') : null,
    p.localidad,
  ].filter(Boolean);
}

/**
 * Texto plano de hasta `max` caracteres, cortado en palabra (para meta description).
 * @param {string | null} texto @param {number} [max]
 */
export function recortar(texto, max = 155) {
  if (!texto) return '';
  const limpio = texto.replace(/\s+/g, ' ').trim();
  if (limpio.length <= max) return limpio;
  return `${limpio.slice(0, limpio.lastIndexOf(' ', max - 1))}…`;
}

/* RESUMEN
   Formateo es-AR: formatPrecio (USD/$ o "Consultar precio"), precioPublico(p) (respeta mostrar_precio),
   formatSuperficie (m² o ha), plural,
   datosClave(propiedad) para cards y metadata, y recortar(texto) para descriptions.
   Depende de: types/index.js (solo JSDoc) */
