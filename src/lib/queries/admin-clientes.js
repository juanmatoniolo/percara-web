// src/lib/queries/admin-clientes.js
import 'server-only';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

/* Lecturas de la agenda de clientes con la sesión del admin (RLS: solo admin). Sin caché.
   Llamar SIEMPRE después de requireAdmin(). */

const filtrosSchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  rol: z.enum(['comprador', 'propietario']).optional().catch(undefined),
});

/** Saca de la búsqueda los caracteres que tienen significado en los filtros de PostgREST. */
const limpiar = (q) => q.replace(/[%_,()*.:"\\]/g, ' ').trim();

/** @param {{ q?: string, rol?: string }} filtros */
export async function listarClientes(filtros = {}) {
  const { q, rol } = filtrosSchema.parse(filtros);
  const supabase = await createSupabaseServer();
  let query = supabase.from('clientes').select(
    `id, nombre, telefono, localidad, busca, activo, updated_at,
       vinculos:cliente_propiedades${rol ? '!inner' : ''}(rol)`,
  );
  if (rol) query = query.eq('vinculos.rol', rol);
  const texto = q ? limpiar(q) : '';
  if (texto) {
    query = query.or(
      `nombre.ilike.%${texto}%,telefono.ilike.%${texto}%,dni_cuit.ilike.%${texto}%,localidad.ilike.%${texto}%`,
    );
  }
  const { data, error } = await query
    .order('activo', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(300);
  if (error) return { ok: false, error: 'No se pudieron cargar los clientes.' };
  return { ok: true, data };
}

/**
 * Cliente con sus propiedades vinculadas (como dueño o comprador).
 * @param {string} id
 */
export async function getCliente(id) {
  if (!z.string().uuid().safeParse(id).success) return { ok: true, data: null };
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('clientes')
    .select(
      `*, vinculos:cliente_propiedades(rol, estado, notas, fecha_visita,
        propiedad:propiedades(id, titulo, slug, estado, precio, moneda, imagenes))`,
    )
    .eq('id', id)
    .maybeSingle();
  if (error) return { ok: false, error: 'No se pudo cargar el cliente.' };
  return { ok: true, data };
}

/**
 * Dueños y compradores de una propiedad, con su teléfono para contactarlos.
 * @param {string} propiedadId
 */
export async function vinculosDePropiedad(propiedadId) {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('cliente_propiedades')
    .select('rol, estado, notas, cliente:clientes(id, nombre, telefono)')
    .eq('propiedad_id', propiedadId)
    .order('created_at');
  if (error) return { ok: false, error: 'No se pudieron cargar los contactos.' };
  return { ok: true, data };
}

/** Clientes para los selects (vincular, pedidos). */
export async function opcionesClientes() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from('clientes')
    .select('id, nombre, telefono')
    .eq('activo', true)
    .order('nombre')
    .limit(1000);
  return data ?? [];
}

/** Propiedades para los selects (vincular, pedidos). Incluye borradores y vendidas. */
export async function opcionesPropiedades() {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from('propiedades')
    .select('id, titulo, estado')
    .order('titulo')
    .limit(1000);
  return data ?? [];
}

/* RESUMEN
   Lecturas de la agenda de clientes (sesión admin, sin caché): listarClientes({q, rol}) con búsqueda por
   nombre/teléfono/DNI/localidad, getCliente(id) con sus propiedades, vinculosDePropiedad(id) y opciones
   para selects. Requiere requireAdmin() antes. Depende de: lib/supabase/server.js, zod, server-only */
