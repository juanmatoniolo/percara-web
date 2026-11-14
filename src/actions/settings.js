// src/actions/settings.js
'use server';

import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { assertAdmin } from '@/lib/auth';
import { TAG_PROPIEDADES } from '@/lib/supabase/public';
import { leerForm } from '@/lib/schemas/campos';
import { configuracionSchema } from '@/lib/schemas/configuracion';

/**
 * Guarda los datos de contacto de la inmobiliaria (useActionState) e invalida el sitio público para que
 * todos los botones (WhatsApp, llamar, email, ubicación, redes) usen los datos nuevos.
 * @returns {Promise<{ ok: boolean, error?: string, campos?: Record<string, string[]>, valores?: object }>}
 */
export async function guardarConfiguracion(_prev, formData) {
  const valores = leerForm(configuracionSchema, formData);
  const auth = await assertAdmin();
  if (!auth.ok) return { ...auth, valores };

  const parsed = configuracionSchema.safeParse(valores);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revise los campos marcados.',
      campos: z.flattenError(parsed.error).fieldErrors,
      valores,
    };
  }

  /* Solo update (la fila única la crea la migración; el admin no tiene permiso de insert) */
  const { data, error } = await auth.supabase
    .from('configuracion')
    .update(parsed.data)
    .eq('id', true)
    .select('id');
  if (error || !data?.length) {
    if (error) console.error('guardarConfiguracion:', error.code, error.message);
    return {
      ok: false,
      error: error
        ? 'No se pudo guardar. Intente de nuevo.'
        : 'Falta la fila de configuración: ejecute la migración 005 en Supabase.',
      valores,
    };
  }

  /* Los datos de contacto viajan en la misma caché que las propiedades (ISR del sitio) */
  revalidateTag(TAG_PROPIEDADES);
  revalidatePath('/dashboard/configuracion');
  return { ok: true, valores: parsed.data };
}

/* RESUMEN
   Server Action de configuración: verifica admin, valida con Zod, guarda la fila única de
   `configuracion` y revalida el sitio público (tag 'propiedades') y el panel.
   Depende de: lib/auth.js, lib/schemas/{campos,configuracion}.js, lib/supabase/public.js */
