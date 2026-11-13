// src/lib/queries/categories.js

/**
 * @typedef {Object} Categoria
 * @property {string} slug   Slug de URL (coincide con `categorias.slug`).
 * @property {string} nombre Nombre visible.
 */

/**
 * Seed estático de las 9 categorías (match 1:1 con la tabla `categorias` en
 * Supabase). Cuando exista `lib/supabase/server.js`, reemplazar por una
 * lectura real desde la DB sin tocar a los consumidores.
 * @type {Categoria[]}
 */
export const CATEGORIAS = [
  { slug: 'campos', nombre: 'Campos' },
  { slug: 'casas', nombre: 'Casas' },
  { slug: 'departamentos', nombre: 'Departamentos' },
  { slug: 'forestaciones', nombre: 'Forestaciones' },
  { slug: 'galpones', nombre: 'Galpones' },
  { slug: 'locales-y-oficinas', nombre: 'Locales comerciales y oficinas' },
  { slug: 'quintas', nombre: 'Quintas' },
  { slug: 'terrenos', nombre: 'Terrenos' },
  { slug: 'otras-propiedades', nombre: 'Otras Propiedades' },
];

/* RESUMEN
 * Categorías (slug + nombre) para header y grid de la home. Vive en
 * lib/queries/ porque más adelante leerá desde Supabase. Lo importan
 * header.jsx y category-grid.jsx desde '@/lib/queries/categories'.
 */
