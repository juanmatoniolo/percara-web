// src/lib/queries/settings.js
import 'server-only';
import { cache } from 'react';
import { getPublicClient } from '@/lib/supabase/public';
import { createSupabaseServer } from '@/lib/supabase/server';
import { armarContacto } from '@/lib/contacto';

export const CAMPOS_CONFIG =
  'telefono, whatsapp, email, direccion, localidad, provincia, maps_url, instagram, facebook';

/**
 * Datos de contacto para el sitio público. Lectura cacheada con el tag 'propiedades' (ISR); si la base
 * falla o falta un dato, usa el respaldo de lib/site-config.js: el sitio nunca queda sin contacto.
 * Cacheada por request (varios componentes la piden en la misma página).
 * @returns {Promise<import('@/lib/contacto').Contacto>}
 */
export const getContacto = cache(async () => {
  try {
    const { data, error } = await getPublicClient()
      .from('configuracion')
      .select(CAMPOS_CONFIG)
      .eq('id', true)
      .maybeSingle();
    if (error) console.error('getContacto:', error.code, error.message);
    return armarContacto(error ? null : data);
  } catch {
    return armarContacto(null);
  }
});

/** Fila cruda para el formulario del panel (sesión admin, sin caché). Llamar después de requireAdmin(). */
export async function getConfiguracionAdmin() {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('configuracion')
    .select(`${CAMPOS_CONFIG}, updated_at`)
    .eq('id', true)
    .maybeSingle();
  if (error)
    return { ok: false, error: 'No se pudieron cargar los datos. ¿Ejecutó la migración 005?' };
  return { ok: true, data };
}

/* RESUMEN
   Lecturas de la configuración: getContacto() para el sitio (cacheada con tag 'propiedades', con
   respaldo si falla) y getConfiguracionAdmin() para el formulario del panel (sesión admin).
   Depende de: lib/supabase/{public,server}.js, lib/contacto.js, react cache, server-only */
