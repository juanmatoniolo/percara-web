// src/types/index.js

/**
 * @typedef {Object} Categoria
 * @property {number} [id]
 * @property {string} nombre
 * @property {string} slug
 * @property {number} [orden]
 */

/**
 * @typedef {Object} ImagenPropiedad
 * @property {string} [id]  uuid de la imagen (clave en R2: propiedades/{propiedad}/{id}-{400|900|1600}.webp).
 * @property {string} url   URL de la variante 1600w (R2) o ruta local (/banner.webp).
 * @property {string} alt
 * @property {number} orden 0 = portada.
 * @property {number} ancho
 * @property {number} alto
 * @property {string} [blur] blurDataURL (10px).
 */

/**
 * @typedef {Object} Propiedad
 * @property {string} id
 * @property {string} titulo
 * @property {string} slug
 * @property {string | null} descripcion
 * @property {number | null} precio
 * @property {boolean} mostrar_precio  false = se muestra "Consultar precio".
 * @property {'ARS' | 'USD'} moneda
 * @property {'venta' | 'alquiler'} operacion
 * @property {Categoria} categoria
 * @property {string | null} localidad
 * @property {string | null} direccion
 * @property {number | null} lat
 * @property {number | null} lng
 * @property {number | null} superficie_total
 * @property {number | null} superficie_cubierta
 * @property {number | null} ambientes
 * @property {number | null} dormitorios
 * @property {number | null} banos
 * @property {boolean} cochera
 * @property {ImagenPropiedad[]} imagenes
 * @property {string | null} og_image_url
 * @property {boolean} destacada
 * @property {'borrador' | 'publicada' | 'vendida'} estado
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Configuracion
 * @property {string | null} telefono
 * @property {string | null} whatsapp
 * @property {string | null} email
 * @property {string | null} direccion
 * @property {Record<string, string>} redes
 * @property {Record<string, string>} horarios
 * @property {string | null} texto_sobre_nosotros
 */

/**
 * @template T
 * @typedef {{ ok: true, data: T } | { ok: false, error: string }} ActionResult
 */

export {};

/* RESUMEN
   Tipos del dominio solo como @typedef JSDoc (Categoria, ImagenPropiedad, Propiedad, Configuracion,
   ActionResult). No exporta valores en runtime. Lo usan queries, componentes y actions.
   Depende de: nada */
