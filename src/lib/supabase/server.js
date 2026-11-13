// src/lib/supabase/server.js
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { publicEnv } from '@/lib/env-public';

/**
 * Cliente Supabase con la sesión del usuario (cookies). Usar en Server Components, Server Actions y
 * Route Handlers del panel. Las consultas pasan por RLS como ese usuario.
 */
export async function createSupabaseServer() {
  const store = await cookies();
  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(lista) {
          try {
            lista.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            /* Desde un Server Component no se pueden escribir cookies; el middleware renueva la sesión */
          }
        },
      },
    },
  );
}

/* RESUMEN
   Cliente Supabase de servidor con sesión en cookies (@supabase/ssr, getAll/setAll) y clave publishable.
   Exporta createSupabaseServer() (async). Lo usan lib/auth.js, actions y queries del panel.
   Depende de: next/headers, @supabase/ssr, lib/env-public.js, server-only */
