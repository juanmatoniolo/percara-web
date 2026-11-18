// src/lib/queries/properties.js
import 'server-only';
import { z } from 'zod';
import { getPublicClient } from '@/lib/supabase/public';
import { SIN_BARRIO } from '@/lib/listado';

const slugSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const CAMPOS_BASE = `id, titulo, slug, descripcion, precio, mostrar_precio, moneda, operacion, localidad, direccion, lat, lng,
  superficie_total, superficie_cubierta, superficie_semicubierta, medida_frente, medida_fondo, ambientes, dormitorios, banos, cochera, imagenes,
  og_image_url, destacada, estado, created_at, updated_at, categoria:categorias!inner(nombre, slug)`;
/* provincia y barrio llegan con la migración 009: sin ella (error 42703) se lee sin esas columnas y el
   sitio sigue funcionando (sin filtro de barrio). */
const CAMPOS = `${CAMPOS_BASE}, provincia, barrio`;
const SIN_COLUMNA = '42703';

/** Corre la consulta con `completo` y, si la base no tiene alguna columna nueva, con `base`. */
async function conRespaldo(armar, completo, base) {
  const r = await armar(completo);
  return r.error?.code === SIN_COLUMNA ? armar(base) : r;
}

/* Visibles en el sitio: publicadas y vendidas. RLS deja pasar las vendidas solo mientras
   vendida_hasta > now() (60 días renovables), así que al vencer desaparecen sin tocar el código. */
const VISIBLES = ['publicada', 'vendida'];

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
 * Propiedades visibles: disponibles primero y vendidas al final; dentro de cada grupo, más nuevas
 * primero (destacadas antes si se pide), con total para paginar. `soloDisponibles` deja afuera las
 * vendidas (home). `provincia`, `localidad` y `barrio` deben venir validados contra getLugares
 * (barrio SIN_BARRIO = las que no tienen barrio). `conPrecio` deja solo las de precio publicado.
 * @param {{ categoria?: string, provincia?: string, localidad?: string, barrio?: string,
 *   conPrecio?: boolean, pagina?: number, limite?: number,
 *   destacadasPrimero?: boolean, soloDisponibles?: boolean }} [opts]
 * @returns {Promise<{ ok: true, data: import('@/types').Propiedad[], total: number } | { ok: false, error: string }>}
 */
export async function getPropiedades({
  categoria,
  provincia,
  localidad,
  barrio,
  conPrecio = false,
  pagina = 1,
  limite = 48,
  destacadasPrimero = false,
  soloDisponibles = false,
} = {}) {
  if (categoria && !slugSchema.safeParse(categoria).success)
    return { ok: true, data: [], total: 0 };

  const inicio = (pagina - 1) * limite;
  const armar = (campos) => {
    let query = getPublicClient()
      .from('propiedades')
      .select(campos, { count: 'exact' })
      .in('estado', soloDisponibles ? ['publicada'] : VISIBLES);
    if (categoria) query = query.eq('categoria.slug', categoria);
    if (localidad) query = query.eq('localidad', localidad);
    /* provincia y barrio solo existen con la 009 (con CAMPOS_BASE no se filtran) */
    if (campos === CAMPOS) {
      if (provincia) query = query.eq('provincia', provincia);
      if (barrio === SIN_BARRIO) query = query.is('barrio', null);
      else if (barrio) query = query.eq('barrio', barrio);
    }
    if (conPrecio) query = query.eq('mostrar_precio', true).gt('precio', 0);
    /* 'publicada' < 'vendida' alfabéticamente: las vendidas quedan al final */
    query = query.order('estado', { ascending: true });
    if (destacadasPrimero) query = query.order('destacada', { ascending: false });
    return query.order('created_at', { ascending: false }).range(inicio, inicio + limite - 1);
  };

  const { data, error, count } = await conRespaldo(armar, CAMPOS, CAMPOS_BASE);
  if (error) {
    console.error('getPropiedades:', error.code);
    return { ok: false, error: 'No se pudieron cargar las propiedades.' };
  }
  return { ok: true, data: data.map(normalizar), total: count ?? data.length };
}

const orden = (a, b) => a.nombre.localeCompare(b.nombre, 'es');

/**
 * Árbol de lugares con propiedades visibles (opcionalmente de una categoría): provincias > localidades
 * > barrios, cada nivel con su cantidad; `sinBarrio` cuenta las de la localidad sin barrio asignado.
 * Solo aparece lo que existe en la tabla. Es la lista blanca de ?provincia=, ?localidad= y ?barrio=.
 * Sin la migración 009 las provincias quedan en una sola rama con nombre null.
 * @param {string} [categoria]  slug
 * @returns {Promise<import('@/lib/listado').ArbolLugares>}
 */
export async function getLugares(categoria) {
  if (categoria && !slugSchema.safeParse(categoria).success) return [];
  const armar = (campos) => {
    const query = getPublicClient()
      .from('propiedades')
      .select(`${campos}, categoria:categorias!inner(slug)`)
      .in('estado', VISIBLES)
      .not('localidad', 'is', null);
    return categoria ? query.eq('categoria.slug', categoria) : query;
  };
  const { data, error } = await conRespaldo(armar, 'provincia, localidad, barrio', 'localidad');
  if (error) return [];

  const provincias = new Map();
  for (const { provincia = null, localidad, barrio = null } of data) {
    const prov = provincias.get(provincia) ?? { nombre: provincia, n: 0, localidades: new Map() };
    const loc = prov.localidades.get(localidad) ?? {
      nombre: localidad,
      n: 0,
      sinBarrio: 0,
      barrios: new Map(),
    };
    prov.n += 1;
    loc.n += 1;
    if (barrio) loc.barrios.set(barrio, (loc.barrios.get(barrio) ?? 0) + 1);
    else loc.sinBarrio += 1;
    prov.localidades.set(localidad, loc);
    provincias.set(provincia, prov);
  }
  return [...provincias.values()]
    .map((p) => ({
      ...p,
      localidades: [...p.localidades.values()]
        .map((l) => ({
          ...l,
          barrios: [...l.barrios].map(([nombre, n]) => ({ nombre, n })).sort(orden),
        }))
        .sort(orden),
    }))
    .sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es'));
}

/**
 * Una propiedad publicada por slug, o null si no existe.
 * @param {string} slug
 * @returns {Promise<{ ok: true, data: import('@/types').Propiedad | null } | { ok: false, error: string }>}
 */
export async function getPropiedad(slug) {
  if (!slugSchema.safeParse(slug).success) return { ok: true, data: null };

  const { data, error } = await conRespaldo(
    (campos) =>
      getPublicClient()
        .from('propiedades')
        .select(campos)
        .in('estado', VISIBLES)
        .eq('slug', slug)
        .maybeSingle(),
    CAMPOS,
    CAMPOS_BASE,
  );

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
    .in('estado', VISIBLES);
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
    .in('estado', VISIBLES)
    .order('updated_at', { ascending: false })
    .limit(5000);
  if (error) {
    console.error('getPropiedadesSitemap:', error.code);
    return [];
  }
  return data;
}

/* RESUMEN
   Lecturas públicas de propiedades (publicadas + vendidas vigentes según RLS, cacheadas con tag
   'propiedades'): getPropiedades({categoria, provincia, localidad, barrio, conPrecio, pagina, limite,
   destacadasPrimero, soloDisponibles}) con total y vendidas al final, getLugares(categoria) (árbol
   provincia > localidad > barrio con cantidades), getPropiedad(slug), getConteoPorCategoria() y
   getPropiedadesSitemap(). Sin la migración 009 reintenta sin provincia/barrio.
   Valida slugs con Zod y devuelve { ok, data } o { ok: false, error } sin detalles internos.
   Depende de: lib/supabase/public.js, zod, types/index.js */
