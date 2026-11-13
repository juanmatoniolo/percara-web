// src/lib/auth.js
import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';

/**
 * Usuario admin de la request actual o null. Valida el token con Supabase Auth (getUser) y que el
 * usuario figure en `administradores` (función es_admin). Cacheado por request.
 * @returns {Promise<{ id: string, email: string } | null>}
 */
export const getAdmin = cache(async () => {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: esAdmin, error } = await supabase.rpc('es_admin');
  if (error || esAdmin !== true) return null;
  return { id: user.id, email: user.email ?? '' };
});

/** Para páginas y layouts del panel: redirige a /login si no hay admin. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect('/login');
  return admin;
}

/**
 * Para Server Actions: devuelve el cliente con sesión o un error, nunca redirige.
 * @returns {Promise<{ ok: true, supabase: Awaited<ReturnType<typeof createSupabaseServer>> } | { ok: false, error: string }>}
 */
export async function assertAdmin() {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: 'Sesión vencida o sin permisos. Vuelva a ingresar.' };
  return { ok: true, supabase: await createSupabaseServer() };
}

/* RESUMEN
   Verificación de admin en servidor: getAdmin() (usuario validado + es_admin, cacheado por request),
   requireAdmin() para páginas (redirige a /login) y assertAdmin() para Server Actions ({ ok, supabase }
   o { ok: false, error }). Depende de: lib/supabase/server.js, react cache, next/navigation */
