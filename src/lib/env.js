// src/lib/env.js
import 'server-only';
import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  R2_ACCOUNT_ID: z.string().min(10),
  R2_ACCESS_KEY_ID: z.string().min(10),
  R2_SECRET_ACCESS_KEY: z.string().min(20),
  R2_BUCKET: z.string().min(1),
  R2_PUBLIC_URL: z.string().url(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const errores = parsed.error.flatten().fieldErrors;
  console.error('❌ Variables de entorno inválidas:', errores);
  throw new Error('Configuración de entorno inválida. Revisá .env.local');
}

/** @type {z.infer<typeof schema>} */
export const env = parsed.data;

/* RESUMEN
 * Valida con Zod las variables de entorno del servidor (Supabase + R2 + site).
 * Exporta `env` tipado. Falla al primer import si falta o está mal una variable.
 * Depende: zod, server-only. Lo importan: layout raíz, clients Supabase, R2.
 */
