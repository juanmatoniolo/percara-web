// src/actions/pedidos.js
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertAdmin } from '@/lib/auth';
import { leerForm, uuidSchema } from '@/lib/schemas/campos';
import { estadoPedidoSchema, pedidoSchema, volverSchema } from '@/lib/schemas/pedido';
import { COOKIE_VISTA_PEDIDOS } from '@/lib/schemas/agenda-etiquetas';

const revalidarPanel = () => revalidatePath('/dashboard', 'layout');

/**
 * Alta o edición de un pedido (useActionState). Con `id` actualiza. Al terminar vuelve a `volver`
 * (lista, calendario o ficha del cliente). En error devuelve `valores` para no perder lo escrito.
 */
export async function guardarPedido(_prev, formData) {
  const valores = leerForm(pedidoSchema, formData);
  const auth = await assertAdmin();
  if (!auth.ok) return { ...auth, valores };

  const parsed = pedidoSchema.safeParse(valores);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revise los campos marcados.',
      campos: z.flattenError(parsed.error).fieldErrors,
      valores,
    };
  }

  const id = formData.get('id');
  const { supabase } = auth;
  const { error } = id
    ? uuidSchema.safeParse(id).success
      ? await supabase.from('pedidos').update(parsed.data).eq('id', id)
      : { error: { code: 'id', message: 'id inválido' } }
    : await supabase.from('pedidos').insert(parsed.data);
  if (error) {
    console.error('guardarPedido:', error.code, error.message);
    return { ok: false, error: 'No se pudo guardar. Intente de nuevo.', valores };
  }
  revalidarPanel();
  redirect(volverSchema.parse(formData.get('volver') ?? ''));
}

/** Marca un pedido como hecho, pendiente o cancelado. Form con `id` y `estado`. */
export async function cambiarEstadoPedido(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const id = uuidSchema.safeParse(formData.get('id'));
  const estado = estadoPedidoSchema.safeParse(formData.get('estado'));
  if (!id.success || !estado.success) return { ok: false, error: 'Datos inválidos.' };

  const { error } = await auth.supabase
    .from('pedidos')
    .update({ estado: estado.data })
    .eq('id', id.data);
  if (error) return { ok: false, error: 'No se pudo actualizar.' };
  revalidarPanel();
  return { ok: true };
}

/** Borra un pedido. Form con `id` y `volver`. */
export async function borrarPedido(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const id = uuidSchema.safeParse(formData.get('id'));
  if (!id.success) return { ok: false, error: 'Datos inválidos.' };

  const { error } = await auth.supabase.from('pedidos').delete().eq('id', id.data);
  if (error) return { ok: false, error: 'No se pudo borrar.' };
  revalidarPanel();
  redirect(volverSchema.parse(formData.get('volver') ?? ''));
}

/** Recuerda la vista elegida (lista o calendario) en una cookie de un año y abre esa vista. */
export async function elegirVista(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const vista = formData.get('vista') === 'calendario' ? 'calendario' : 'lista';
  const mes = String(formData.get('mes') ?? '');
  (await cookies()).set(COOKIE_VISTA_PEDIDOS, vista, {
    path: '/dashboard',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  const qs = new URLSearchParams({ vista });
  if (/^\d{4}-\d{2}$/.test(mes)) qs.set('mes', mes);
  redirect(`/dashboard/pedidos?${qs}`);
}

/* RESUMEN
   Server Actions de la Carpeta de pedidos (verifican admin; RLS limita al autor): guardarPedido
   (alta/edición y vuelta segura), cambiarEstadoPedido, borrarPedido y elegirVista (cookie con la vista
   preferida). Depende de: lib/auth.js, lib/schemas/{campos,pedido}.js, next/headers */
