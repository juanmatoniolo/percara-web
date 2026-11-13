// src/lib/supabase/public.js
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { publicEnv } from '@/lib/env-public';

/** Tag de caché de Next para todas las lecturas de propiedades (revalidateTag('propiedades')). */
export const TAG_PROPIEDADES = 'propiedades';
const REVALIDAR_SEG = 3600;

/* Sin cookies: las lecturas públicas quedan cacheables (ISR) y las filtra RLS (solo 'publicada').
   Cada fetch de supabase-js lleva el tag para invalidarlo desde las Server Actions. */
const cachedFetch = (url, init) =>
  fetch(url, { ...init, next: { tags: [TAG_PROPIEDADES], revalidate: REVALIDAR_SEG } });

let client;

export function getPublicClient() {
  client ??= createClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: cachedFetch },
    },
  );
  return client;
}

/* RESUMEN
   Cliente Supabase de solo lectura para páginas públicas (sin sesión ni cookies, clave publishable).
   Envuelve fetch con tag 'propiedades' y revalidación de 1 h para ISR. Exporta getPublicClient()
   y TAG_PROPIEDADES. Depende de: @supabase/supabase-js, lib/env-public.js, server-only */
