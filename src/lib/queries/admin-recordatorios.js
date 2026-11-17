// src/lib/queries/admin-recordatorios.js
import 'server-only';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { ESTADOS_RECORDATORIO } from '@/lib/schemas/recordatorio-etiquetas';

/* Recordatorios (negocios cerrados): solo admin por RLS. Llamar SIEMPRE después de requireAdmin(). */

const CAMPOS = `id, titulo, fecha_operacion, cliente_id, propiedad_id, forma_pago, medio_pago, moneda,
  monto_total, anticipo, cantidad_cuotas, monto_cuota, moneda_cuotas, primer_vencimiento, estado,
  observaciones, created_at, updated_at,
  cliente:clientes(id, nombre, telefono), propiedad:propiedades(id, titulo, slug)`;

const filtrosSchema = z.object({
  estado: z
    .enum(/** @type {[string, ...string[]]} */ (Object.keys(ESTADOS_RECORDATORIO)))
    .optional(),
  q: z.string().trim().max(80).optional(),
});

/* numeric de Postgres llega como string */
const NUMEROS = ['monto_total', 'anticipo', 'monto_cuota'];
function normalizar(r) {
  const fila = { ...r };
  for (const k of NUMEROS) fila[k] = r[k] === null ? null : Number(r[k]);
  return fila;
}

/**
 * Listado con filtro por estado y búsqueda por título (que suele llevar cliente y propiedad).
 * @param {{ estado?: string, q?: string }} filtros
 */
export async function listarRecordatorios(filtros) {
  const f = filtrosSchema.safeParse(filtros);
  if (!f.success) return { ok: true, data: [] };
  const supabase = await createSupabaseServer();
  let query = supabase.from('recordatorios').select(CAMPOS);
  if (f.data.estado) query = query.eq('estado', f.data.estado);
  if (f.data.q) query = query.ilike('titulo', `%${f.data.q.replace(/[%_,()]/g, ' ')}%`);
  const { data, error } = await query
    .order('fecha_operacion', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) return { ok: false, error: 'No se pudieron cargar los recordatorios.' };
  return { ok: true, data: data.map(normalizar) };
}

/** @param {string} id */
export async function getRecordatorio(id) {
  if (!z.string().uuid().safeParse(id).success) return { ok: true, data: null };
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('recordatorios')
    .select(CAMPOS)
    .eq('id', id)
    .maybeSingle();
  if (error) return { ok: false, error: 'No se pudo cargar el recordatorio.' };
  return { ok: true, data: data ? normalizar(data) : null };
}

/* RESUMEN
   Lecturas de Recordatorios (sesión admin, sin caché): listarRecordatorios({estado, q}) validado con Zod y
   getRecordatorio(id), con cliente y propiedad vinculados y montos como número.
   Depende de: lib/supabase/server.js, lib/schemas/recordatorio-etiquetas.js, zod, server-only */
