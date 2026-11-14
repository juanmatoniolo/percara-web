// src/actions/clientes.js
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertAdmin } from '@/lib/auth';
import { leerForm, uuidSchema } from '@/lib/schemas/campos';
import { clienteSchema, estadoInteresSchema, vinculoSchema } from '@/lib/schemas/cliente';

/* La agenda es privada: nada de esto toca el caché del sitio público, solo el panel */
const revalidarPanel = () => revalidatePath('/dashboard', 'layout');

/**
 * Alta o edición de cliente (useActionState). Con `id` actualiza; sin `id` crea y abre su ficha.
 * En error devuelve `valores` para no perder lo escrito.
 */
export async function guardarCliente(_prev, formData) {
  const valores = leerForm(clienteSchema, formData);
  const auth = await assertAdmin();
  if (!auth.ok) return { ...auth, valores };

  const parsed = clienteSchema.safeParse(valores);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revise los campos marcados.',
      campos: z.flattenError(parsed.error).fieldErrors,
      valores,
    };
  }

  const id = formData.get('id');
  if (id) {
    if (!uuidSchema.safeParse(id).success)
      return { ok: false, error: 'Cliente inválido.', valores };
    const { error } = await auth.supabase.from('clientes').update(parsed.data).eq('id', id);
    if (error) {
      console.error('guardarCliente (update):', error.code, error.message);
      return { ok: false, error: 'No se pudo guardar. Intente de nuevo.', valores };
    }
    revalidarPanel();
    redirect(`/dashboard/clientes/${id}?aviso=guardado`);
  }

  const { data, error } = await auth.supabase
    .from('clientes')
    .insert(parsed.data)
    .select('id')
    .single();
  if (error) {
    console.error('guardarCliente (insert):', error.code, error.message);
    return { ok: false, error: 'No se pudo crear. Intente de nuevo.', valores };
  }
  revalidarPanel();
  redirect(`/dashboard/clientes/${data.id}?aviso=creado`);
}

/** Borra el cliente (sus vínculos se borran solos; sus pedidos quedan sin cliente). Form con `id`. */
export async function borrarCliente(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const id = uuidSchema.safeParse(formData.get('id'));
  if (!id.success) return { ok: false, error: 'Datos inválidos.' };

  const { error } = await auth.supabase.from('clientes').delete().eq('id', id.data);
  if (error) return { ok: false, error: 'No se pudo borrar.' };
  revalidarPanel();
  redirect('/dashboard/clientes?aviso=borrado');
}

/**
 * Vincula un cliente con una propiedad como dueño o comprador (useActionState). Si ya estaban
 * vinculados, actualiza rol, seguimiento y notas.
 */
export async function vincularPropiedad(_prev, formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const parsed = vinculoSchema.safeParse(
    Object.fromEntries(
      ['cliente_id', 'propiedad_id', 'rol', 'estado', 'notas'].map((k) => [k, formData.get(k)]),
    ),
  );
  if (!parsed.success) return { ok: false, error: 'Elija el cliente o la propiedad y el rol.' };

  const { error } = await auth.supabase
    .from('cliente_propiedades')
    .upsert(parsed.data, { onConflict: 'cliente_id,propiedad_id' });
  if (error) {
    console.error('vincularPropiedad:', error.code, error.message);
    return { ok: false, error: 'No se pudo vincular. Intente de nuevo.' };
  }
  revalidarPanel();
  /* `n` cambia en cada éxito: el form lo usa como key para vaciar el buscador */
  return { ok: true, error: null, n: Date.now() };
}

/** Cambia el seguimiento de un comprador. Form con `cliente_id`, `propiedad_id` y `estado`. */
export async function cambiarEstadoInteres(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const cliente = uuidSchema.safeParse(formData.get('cliente_id'));
  const propiedad = uuidSchema.safeParse(formData.get('propiedad_id'));
  const estado = estadoInteresSchema.safeParse(formData.get('estado'));
  if (!cliente.success || !propiedad.success || !estado.success) {
    return { ok: false, error: 'Datos inválidos.' };
  }

  const { error } = await auth.supabase
    .from('cliente_propiedades')
    .update({ estado: estado.data })
    .match({ cliente_id: cliente.data, propiedad_id: propiedad.data, rol: 'comprador' });
  if (error) return { ok: false, error: 'No se pudo actualizar.' };
  revalidarPanel();
  return { ok: true };
}

/** Quita el vínculo. Form con `cliente_id` y `propiedad_id`. */
export async function desvincularPropiedad(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const cliente = uuidSchema.safeParse(formData.get('cliente_id'));
  const propiedad = uuidSchema.safeParse(formData.get('propiedad_id'));
  if (!cliente.success || !propiedad.success) return { ok: false, error: 'Datos inválidos.' };

  const { error } = await auth.supabase
    .from('cliente_propiedades')
    .delete()
    .match({ cliente_id: cliente.data, propiedad_id: propiedad.data });
  if (error) return { ok: false, error: 'No se pudo quitar.' };
  revalidarPanel();
  return { ok: true };
}

/* RESUMEN
   Server Actions de la agenda de clientes (cada una verifica admin y valida con Zod): guardarCliente
   (alta/edición), borrarCliente, vincularPropiedad (dueño o comprador; upsert), cambiarEstadoInteres y
   desvincularPropiedad. Solo revalidan el panel. Depende de: lib/auth.js, lib/schemas/{campos,cliente}.js */
