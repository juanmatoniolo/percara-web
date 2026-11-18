// src/lib/queries/admin-properties.js
import 'server-only';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

/* Lecturas del panel: usan la sesión del admin (RLS permite ver borradores y vendidas).
   Llamar SIEMPRE después de requireAdmin(). Sin caché: el panel muestra datos al instante. */

const CAMPOS_BASE = `id, titulo, slug, precio, mostrar_precio, moneda, operacion, localidad, estado, destacada, imagenes,
  updated_at, categoria:categorias!inner(id, nombre, slug)`;
/* vendida_hasta llega con la migración 008: si la base todavía no la tiene (error 42703, columna
   inexistente), se lista sin ella en vez de romper el panel. */
const CAMPOS_LISTA = `${CAMPOS_BASE}, vendida_hasta`;

const filtrosSchema = z.object({
  estado: z.enum(['borrador', 'publicada', 'vendida']).optional().catch(undefined),
  categoria: z
    .string()
    .regex(/^[a-z0-9-]{1,60}$/)
    .optional()
    .catch(undefined),
  q: z.string().trim().max(80).optional().catch(undefined),
});

/** @param {{ estado?: string, categoria?: string, q?: string }} filtros */
export async function listarPropiedadesAdmin(filtros = {}) {
  const { estado, categoria, q } = filtrosSchema.parse(filtros);
  const supabase = await createSupabaseServer();
  const consultar = (campos) => {
    let query = supabase.from('propiedades').select(campos);
    if (estado) query = query.eq('estado', estado);
    if (categoria) query = query.eq('categoria.slug', categoria);
    if (q) query = query.ilike('titulo', `%${q.replace(/[%_,()]/g, ' ')}%`);
    return query.order('updated_at', { ascending: false }).limit(200);
  };

  let { data, error } = await consultar(CAMPOS_LISTA);
  if (error?.code === '42703') ({ data, error } = await consultar(CAMPOS_BASE));
  if (error) {
    console.error('listarPropiedadesAdmin:', error.code);
    return { ok: false, error: 'No se pudieron cargar las propiedades.' };
  }
  return { ok: true, data };
}

/** @param {string} id */
export async function getPropiedadAdmin(id) {
  if (!z.string().uuid().safeParse(id).success) return { ok: true, data: null };
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.from('propiedades').select('*').eq('id', id).maybeSingle();
  if (error) return { ok: false, error: 'No se pudo cargar la propiedad.' };
  return { ok: true, data };
}

/** Conteo por estado para el resumen del panel. */
export async function resumenAdmin() {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.from('propiedades').select('estado, destacada');
  if (error) return { ok: false, error: 'No se pudo cargar el resumen.' };
  const base = { total: data.length, publicada: 0, borrador: 0, vendida: 0, destacada: 0 };
  for (const p of data) {
    base[p.estado] += 1;
    if (p.destacada) base.destacada += 1;
  }
  return { ok: true, data: base };
}

/** Categorías con id (para el select del formulario). */
export async function categoriasConId() {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre, slug')
    .order('orden');
  if (error) return [];
  return data;
}

/**
 * Lugares ya cargados para los selects del formulario: localidades con su provincia y barrios por
 * localidad, en orden alfabético. Sin la migración 009 devuelve solo localidades.
 * @returns {Promise<{ localidades: { nombre: string, provincia: string | null }[], barrios: Record<string, string[]> }>}
 */
export async function lugaresCargados() {
  const supabase = await createSupabaseServer();
  let { data, error } = await supabase.from('propiedades').select('provincia, localidad, barrio');
  if (error?.code === '42703')
    ({ data, error } = await supabase.from('propiedades').select('localidad'));
  if (error) return { localidades: [], barrios: {} };

  const locs = new Map();
  const barrios = {};
  for (const { provincia = null, localidad, barrio = null } of data) {
    if (!localidad) continue;
    if (!locs.has(localidad) || (provincia && !locs.get(localidad))) locs.set(localidad, provincia);
    if (barrio) (barrios[localidad] ??= new Set()).add(barrio);
  }
  const orden = (a, b) => a.localeCompare(b, 'es');
  return {
    localidades: [...locs]
      .map(([nombre, provincia]) => ({ nombre, provincia }))
      .sort((a, b) => orden(a.nombre, b.nombre)),
    barrios: Object.fromEntries(
      Object.entries(barrios).map(([l, set]) => [l, [...set].sort(orden)]),
    ),
  };
}

/* RESUMEN
   Lecturas del panel con sesión de admin (sin caché): listarPropiedadesAdmin({estado, categoria, q})
   validado con Zod, getPropiedadAdmin(id), resumenAdmin() (conteos por estado), categoriasConId() y lugaresCargados() (provincia/localidad/barrio).
   Requiere requireAdmin() antes. Depende de: lib/supabase/server.js, zod, server-only */
