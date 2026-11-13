// src/lib/env-public.js
import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

/* Referencias literales: Next solo inyecta NEXT_PUBLIC_* si se leen así, no con process.env entero */
const parsed = schema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsed.success) {
  console.error('Variables públicas inválidas:', Object.keys(parsed.error.flatten().fieldErrors));
  throw new Error('Configuración pública inválida. Revisá .env.local');
}

export const publicEnv = parsed.data;

/* RESUMEN
   Valida con Zod solo las 3 variables NEXT_PUBLIC_ (Supabase URL, clave publishable, URL del sitio).
   Separado de env.js para que las lecturas públicas no dependan de los secretos de R2 ni de server-only.
   Exporta `publicEnv`. Depende de: zod */
