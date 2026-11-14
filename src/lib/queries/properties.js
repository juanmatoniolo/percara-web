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
  superficie_total, superficie_cubierta, ambientes, dormitorios, banos, cochera, imagenes,
  og_image_url, destacada, estado, created_at, updated_at, categoria:categorias!inner(nombre, slug)`;

/** @param {any} fila @returns {import('@/types').Propiedad} */
function normalizar(fila) {
  const imagenes = Array.isArray(fila.imagenes) ? [...fila.imagenes] : [];
  imagenes.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  return {
    ...fila,
    precio: fila.precio === null ? null : Number(fila.precio),
    superficie_total: fila.superficie_total === null ? null : Number(fila.superficie_total),
    superficie_cubierta:
      fila.superficie_cubierta === null ? null : Number(fila.superficie_cubierta),
    imagenes,
  };
}

/**
 * Propiedades publicadas, más nuevas primero (destacadas antes si se pide).
 * @param {{ categoria?: string, limite?: number, destacadasPrimero?: boolean }} [opts]
 * @returns {Promise<{ ok: true, data: import('@/types').Propiedad[] } | { ok: false, error: string }>}
 */
export async function getPropiedades({ categoria, limite = 48, destacadasPrimero = false } = {}) {
  if (categoria && !slugSchema.safeParse(categoria).success) return { ok: true, data: [] };

  let query = getPublicClient().from('propiedades').select(CAMPOS).eq('estado', 'publicada');
  if (categoria) query = query.eq('categoria.slug', categoria);
  if (destacadasPrimero) query = query.order('destacada', { ascending: false });
  query = query.order('created_at', { ascending: false }).limit(limite);

  const { data, error } = await query;
  if (error) {
    console.error('getPropiedades:', error.code);
    return { ok: false, error: 'No se pudieron cargar las propiedades.' };
  }
  return { ok: true, data: data.map(normalizar) };
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
   getPropiedades({categoria, limite, destacadasPrimero}), getPropiedad(slug), getConteoPorCategoria() y
   getPropiedadesSitemap().
   Valida slugs con Zod y devuelve { ok, data } o { ok: false, error } sin detalles internos.
   Depende de: lib/supabase/public.js, zod, types/index.js */
