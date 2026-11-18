// src/lib/queries/admin-pedidos.js
import 'server-only';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

/* Carpeta de pedidos: RLS ya limita a los pedidos del admin con sesión (autor_id = auth.uid()).
   Llamar SIEMPRE después de requireAdmin(). Sin caché. */

const CAMPOS_BASE = `id, titulo, detalle, fecha, hora, prioridad, estado, completado_en, cliente_id, propiedad_id,
  cliente:clientes(id, nombre, telefono), propiedad:propiedades(id, titulo)`;
/* "Qué busca" llega con la migración 008. Si la base todavía no tiene esas columnas (42703 o, en la
   relación con categorias, PGRST200), se lee sin ellas en vez de romper la Carpeta. */
const CAMPOS = `${CAMPOS_BASE}, categoria_id, presupuesto, moneda, categoria:categorias(nombre)`;
const FALTA_008 = ['42703', 'PGRST200'];

/** Ejecuta la consulta con los campos completos y, si falta la migración 008, con los básicos. */
async function conRespaldo(armar) {
  const r = await armar(CAMPOS);
  return FALTA_008.includes(r.error?.code) ? armar(CAMPOS_BASE) : r;
}

/** Orden de agenda: por fecha (sin fecha al final) y hora. */
const ordenar = (q) =>
  q
    .order('fecha', { ascending: true, nullsFirst: false })
    .order('hora', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true });

/** Pendientes (todas las fechas) y hechos o cancelados de los últimos 30 días. */
export async function pedidosParaLista() {
  const supabase = await createSupabaseServer();
  const hace30 = new Date(Date.now() - 30 * 864e5).toISOString();
  const [pend, cerrados] = await Promise.all([
    conRespaldo((c) =>
      ordenar(supabase.from('pedidos').select(c).eq('estado', 'pendiente')).limit(500),
    ),
    conRespaldo((c) =>
      supabase
        .from('pedidos')
        .select(c)
        .neq('estado', 'pendiente')
        .gte('updated_at', hace30)
        .order('updated_at', { ascending: false })
        .limit(50),
    ),
  ]);
  if (pend.error || cerrados.error) return { ok: false, error: 'No se pudo cargar la carpeta.' };
  return { ok: true, data: { pendientes: pend.data, cerrados: cerrados.data } };
}

/**
 * Pedidos con fecha dentro del rango (para el calendario), en cualquier estado.
 * @param {string} desde YYYY-MM-DD
 * @param {string} hasta YYYY-MM-DD
 */
export async function pedidosEntre(desde, hasta) {
  const supabase = await createSupabaseServer();
  const { data, error } = await conRespaldo((c) =>
    ordenar(supabase.from('pedidos').select(c).gte('fecha', desde).lte('fecha', hasta)).limit(1000),
  );
  if (error) return { ok: false, error: 'No se pudo cargar el calendario.' };
  return { ok: true, data };
}

/** @param {string} clienteId */
export async function pedidosDeCliente(clienteId) {
  const supabase = await createSupabaseServer();
  const { data, error } = await conRespaldo((c) =>
    ordenar(supabase.from('pedidos').select(c).eq('cliente_id', clienteId)).limit(100),
  );
  if (error) return { ok: false, error: 'No se pudieron cargar los pedidos.' };
  return { ok: true, data };
}

/** @param {string} id */
export async function getPedido(id) {
  if (!z.string().uuid().safeParse(id).success) return { ok: true, data: null };
  const supabase = await createSupabaseServer();
  const { data, error } = await conRespaldo((c) =>
    supabase.from('pedidos').select(c).eq('id', id).maybeSingle(),
  );
  if (error) return { ok: false, error: 'No se pudo cargar el pedido.' };
  return { ok: true, data };
}

/* RESUMEN
   Lecturas de la Carpeta de pedidos (sesión admin; RLS solo deja ver los del autor): pedidosParaLista()
   (pendientes + cerrados de 30 días), pedidosEntre(desde, hasta) para el calendario, pedidosDeCliente(id)
   y getPedido(id), con cliente, propiedad y qué busca (tipo, presupuesto, moneda). Depende de: lib/supabase/server.js, zod, server-only */
