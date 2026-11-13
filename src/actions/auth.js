// src/actions/auth.js
'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/schemas/auth';
import { ipCliente, limitar, reiniciar } from '@/lib/rate-limit';

const LIMITE = { max: 5, ventanaMs: 10 * 60 * 1000 };
const ERROR_CREDENCIALES = 'Email o contraseña incorrectos.';

/**
 * Login con email y contraseña (useActionState). Redirige al panel si es admin.
 * @param {{ ok: boolean, error?: string } | null} _prev
 * @param {FormData} formData
 */
export async function iniciarSesion(_prev, formData) {
  const ip = await ipCliente();
  const clave = `login:${ip}`;
  const rl = limitar(clave, LIMITE);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Demasiados intentos. Espere ${Math.ceil(rl.reintentarEnSeg / 60)} min.`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next') ?? '/dashboard',
  });
  if (!parsed.success) return { ok: false, error: ERROR_CREDENCIALES };

  const { email, password, next } = parsed.data;
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: ERROR_CREDENCIALES };

  const { data: esAdmin } = await supabase.rpc('es_admin');
  if (esAdmin !== true) {
    await supabase.auth.signOut();
    return { ok: false, error: 'Esta cuenta no tiene acceso al panel.' };
  }

  reiniciar(clave);
  redirect(next);
}

/** Cierra la sesión y vuelve al login. */
export async function cerrarSesion() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect('/login');
}

/* RESUMEN
   Server Actions de sesión: iniciarSesion (rate limit 5 intentos/10 min por IP, Zod, signInWithPassword,
   exige es_admin y redirige a `next` interno; error genérico sin detalles) y cerrarSesion.
   Depende de: lib/supabase/server.js, lib/schemas/auth.js, lib/rate-limit.js */
