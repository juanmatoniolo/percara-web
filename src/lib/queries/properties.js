// src/lib/queries/properties.js
import 'server-only';
import { z } from 'zod';
import { getPublicClient } from '@/lib/supabase/public';

const slugSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const CAMPOS = `id, titulo, slug, descripcion, precio, mostrar_precio, moneda, operacion, localidad, direccion, lat, lng,
  superficie_total, superficie_cubierta, superficie_semicubierta, medida_frente, medida_fondo, ambientes, dormitorios, banos, cochera, imagenes,
  og_image_url, destacada, estado, created_at, updated_at, categoria:categorias!inner(nombre, slug)`;

/** numeric de Postgres llega como string: lo pasa a número (null si falta). */
const numero = (v) => (v === null || v === undefined ? null : Number(v));

/** @param {any} fila @returns {import('@/types').Propiedad} */
function normalizar(fila) {
  const imagenes = Array.isArray(fila.imagenes) ? [...fila.imagenes] : [];
  imagenes.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  return {
    ...fila,
    precio: fila.precio === null ? null : Number(fila.precio),
    superficie_total: fila.superficie_total === null ? null : Number(fila.superficie_total),
    superficie_cubierta: numero(fila.superficie_cubierta),
    superficie_semicubierta: numero(fila.superficie_semicubierta),
    medida_frente: numero(fila.medida_frente),
    medida_fondo: numero(fila.medida_fondo),
    imagenes,
  };
}

/**
 * Propiedades publicadas, más nuevas primero (destacadas antes si se pide), con total para paginar.
 * `localidad` debe venir validada contra getLocalidades (coincidencia exacta).
 * @param {{ categoria?: string, localidad?: string, pagina?: number, limite?: number,
 *   destacadasPrimero?: boolean }} [opts]
 * @returns {Promise<{ ok: true, data: import('@/types').Propiedad[], total: number } | { ok: false, error: string }>}
 */
export async function getPropiedades({
  categoria,
  localidad,
  pagina = 1,
  limite = 48,
  destacadasPrimero = false,
} = {}) {
  if (categoria && !slugSchema.safeParse(categoria).success)
    return { ok: true, data: [], total: 0 };

  let query = getPublicClient()
    .from('propiedades')
    .select(CAMPOS, { count: 'exact' })
    .eq('estado', 'publicada');
  if (categoria) query = query.eq('categoria.slug', categoria);
  if (localidad) query = query.eq('localidad', localidad);
  if (destacadasPrimero) query = query.order('destacada', { ascending: false });
  const desde = (pagina - 1) * limite;
  query = query.order('created_at', { ascending: false }).range(desde, desde + limite - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error('getPropiedades:', error.code);
    return { ok: false, error: 'No se pudieron cargar las propiedades.' };
  }
  return { ok: true, data: data.map(normalizar), total: count ?? data.length };
}

/**
 * Localidades con propiedades publicadas (opcionalmente de una categoría), con su cantidad, en orden
 * alfabético. Alimenta el filtro del listado y sirve de lista blanca para ?localidad=.
 * @param {string} [categoria]  slug
 * @returns {Promise<{ nombre: string, n: number }[]>}
 */
export async function getLocalidades(categoria) {
  if (categoria && !slugSchema.safeParse(categoria).success) return [];
  let query = getPublicClient()
    .from('propiedades')
    .select('localidad, categoria:categorias!inner(slug)')
    .eq('estado', 'publicada')
    .not('localidad', 'is', null);
  if (categoria) query = query.eq('categoria.slug', categoria);
  const { data, error } = await query;
  if (error) return [];
  const conteo = new Map();
  for (const { localidad } of data) conteo.set(localidad, (conteo.get(localidad) ?? 0) + 1);
  return [...conteo]
    .map(([nombre, n]) => ({ nombre, n }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/**
 * Una propiedad publicada por slug, o null si no existe.
 * @param {string} slug
 * @returns {Promise<{ ok: true, data: import('@/types').Propiedad | null } | { ok: false, error: string }>}
 */
export async function getPropiedad(slug) {
  if (!slugSchema.safeParse(slug).success) return { ok: true, data: null };

  const { data, error } = await getPublicClient()
    .from('propiedades')
    .select(CAMPOS)
    .eq('estado', 'publicada')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('getPropiedad:', error.code);
    return { ok: false, error: 'No se pudo cargar la propiedad.' };
  }
  return { ok: true, data: data ? normalizar(data) : null };
}

/** Cantidad de publicadas por slug de categoría (para las pestañas). */
export async function getConteoPorCategoria() {
  const { data, error } = await getPublicClient()
    .from('propiedades')
    .select('categoria:categorias!inner(slug)')
    .eq('estado', 'publicada');
  if (error) return {};
  return data.reduce((acc, { categoria }) => {
    acc[categoria.slug] = (acc[categoria.slug] ?? 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));
}

/**
 * Datos mínimos de las publicadas para el sitemap (slug, fecha y fotos).
 * @returns {Promise<{ slug: string, updated_at: string, titulo: string, imagenes: any[] }[]>}
 */
export async function getPropiedadesSitemap() {
  const { data, error } = await getPublicClient()
    .from('propiedades')
    .select('slug, titulo, updated_at, imagenes')
    .eq('estado', 'publicada')
    .order('updated_at', { ascending: false })
    .limit(5000);
  if (error) {
    console.error('getPropiedadesSitemap:', error.code);
    return [];
  }
  return data;
}

/* RESUMEN
   Lecturas públicas de propiedades (solo 'publicada', cacheadas con tag 'propiedades'):
   getPropiedades({categoria, localidad, pagina, limite, destacadasPrimero}) con total, getLocalidades(categoria),
   getPropiedad(slug), getConteoPorCategoria() y
   getPropiedadesSitemap().
   Valida slugs con Zod y devuelve { ok, data } o { ok: false, error } sin detalles internos.
   Depende de: lib/supabase/public.js, zod, types/index.js */
