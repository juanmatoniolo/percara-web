// src/actions/recordatorios.js
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertAdmin } from '@/lib/auth';
import { leerForm, uuidSchema } from '@/lib/schemas/campos';
import { recordatorioSchema, SECCIONES_RECORDATORIO } from '@/lib/schemas/recordatorio';
import { CON_CUOTAS } from '@/lib/schemas/recordatorio-etiquetas';

const LISTADO = '/dashboard/recordatorios';
const SIN_CUOTAS = {
  cantidad_cuotas: null,
  monto_cuota: null,
  moneda_cuotas: null,
  primer_vencimiento: null,
};

/**
 * Alta o edición (useActionState). Con `id` actualiza. Si la forma de pago no lleva cuotas, limpia los
 * datos de cuotas. En error devuelve `valores` para no perder lo escrito.
 */
export async function guardarRecordatorio(_prev, formData) {
  const valores = leerForm(recordatorioSchema, formData);
  const auth = await assertAdmin();
  if (!auth.ok) return { ...auth, valores };

  const parsed = recordatorioSchema.safeParse(valores);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revise los campos marcados.',
      campos: z.flattenError(parsed.error).fieldErrors,
      valores,
    };
  }
  const fila = CON_CUOTAS.has(parsed.data.forma_pago)
    ? parsed.data
    : { ...parsed.data, ...SIN_CUOTAS };

  const id = formData.get('id');
  if (id && !uuidSchema.safeParse(id).success) {
    return { ok: false, error: 'Datos inválidos.', valores };
  }
  const tabla = auth.supabase.from('recordatorios');
  const { data, error } = await (id ? tabla.update(fila).eq('id', id) : tabla.insert(fila))
    .select('id')
    .single();
  if (error) {
    console.error('guardarRecordatorio:', error.code, error.message);
    return { ok: false, error: 'No se pudo guardar. Intente de nuevo.', valores };
  }
  revalidatePath(LISTADO);
  revalidatePath(`${LISTADO}/${data.id}`);
  redirect(`${LISTADO}/${data.id}?aviso=${id ? 'guardado' : 'creado'}`);
}

/**
 * Guarda una sola tarjeta de la vista (useActionState): form con `id`, `seccion` (negocio | pago |
 * observaciones) y sus campos. No redirige: la vista se actualiza sola con revalidatePath.
 */
export async function guardarSeccionRecordatorio(_prev, formData) {
  const schema = SECCIONES_RECORDATORIO[String(formData.get('seccion'))];
  if (!schema) return { ok: false, error: 'Datos inválidos.' };
  const valores = leerForm(schema, formData);
  const auth = await assertAdmin();
  if (!auth.ok) return { ...auth, valores };
  const id = uuidSchema.safeParse(formData.get('id'));
  if (!id.success) return { ok: false, error: 'Datos inválidos.', valores };

  const parsed = schema.safeParse(valores);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revise los campos marcados.',
      campos: z.flattenError(parsed.error).fieldErrors,
      valores,
    };
  }
  const fila =
    'forma_pago' in parsed.data && !CON_CUOTAS.has(parsed.data.forma_pago)
      ? { ...parsed.data, ...SIN_CUOTAS }
      : parsed.data;

  const { error } = await auth.supabase.from('recordatorios').update(fila).eq('id', id.data);
  if (error) {
    console.error('guardarSeccionRecordatorio:', error.code, error.message);
    return { ok: false, error: 'No se pudo guardar. Intente de nuevo.', valores };
  }
  revalidatePath(LISTADO);
  revalidatePath(`${LISTADO}/${id.data}`);
  return { ok: true, error: null };
}

/** Borra un recordatorio. Form con `id`. */
export async function borrarRecordatorio(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const id = uuidSchema.safeParse(formData.get('id'));
  if (!id.success) return { ok: false, error: 'Datos inválidos.' };

  const { error } = await auth.supabase.from('recordatorios').delete().eq('id', id.data);
  if (error) return { ok: false, error: 'No se pudo borrar.' };
  revalidatePath(LISTADO);
  redirect(`${LISTADO}?aviso=borrado`);
}

/* RESUMEN
   Server Actions de Recordatorios (verifican admin): guardarRecordatorio (alta/edición con Zod; sin cuotas
   si la forma de pago no las lleva; vuelve a la vista del recordatorio) y borrarRecordatorio (vuelve al
   listado). Ambas con aviso. guardarSeccionRecordatorio guarda una tarjeta de la vista sin redirigir.
   Depende de: lib/auth.js, lib/schemas/{campos,recordatorio,recordatorio-etiquetas}.js */
