// src/lib/slug.js

/**
 * "Casa en Barrio Centro, 3 dorm." -> "casa-en-barrio-centro-3-dorm"
 * @param {string} texto
 * @param {number} [max]
 */
export function slugify(texto, max = 80) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/, '');
}

/* RESUMEN
   slugify(texto, max): quita tildes, pasa a minúsculas, reemplaza todo lo no alfanumérico por guiones
   y recorta a `max` sin dejar guion final. Lo usa actions/properties.js. Depende de: nada */
