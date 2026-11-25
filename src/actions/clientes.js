// src/actions/clientes.js
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertAdmin } from '@/lib/auth';
import { leerForm, uuidSchema } from '@/lib/schemas/campos';
import {
  clienteRapidoSchema,
  clienteSchema,
  estadoInteresSchema,
  vinculoSchema,
} from '@/lib/schemas/cliente';
import { normalizarTelefono } from '@/lib/telefono';

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

/** Vincula propiedades a un cliente sin pisar vínculos existentes (conserva su seguimiento). */
async function vincularVarias(supabase, clienteId, ids, rol) {
  const filas = ids.map((propiedad_id) => ({
    cliente_id: clienteId,
    propiedad_id,
    rol,
    estado: rol === 'comprador' ? 'interesado' : null,
  }));
  return supabase
    .from('cliente_propiedades')
    .upsert(filas, { onConflict: 'cliente_id,propiedad_id', ignoreDuplicates: true });
}

/** Busca un cliente con el mismo celular (comparando el número normalizado). */
async function clienteConTelefono(supabase, telefono) {
  const buscado = normalizarTelefono(telefono) ?? telefono.replace(/\D/g, '');
  const { data } = await supabase
    .from('clientes')
    .select('id, nombre, telefono')
    .not('telefono', 'is', null)
    .limit(5000);
  return (
    (data ?? []).find(
      (c) => (normalizarTelefono(c.telefono) ?? c.telefono.replace(/\D/g, '')) === buscado,
    ) ?? null
  );
}

/**
 * Alta rápida desde Recordatorios (useActionState): nombre + apellido (se guardan juntos en `nombre`),
 * celular y 1 o más propiedades con un rol. Si el celular ya existe devuelve `existente` para elegirlo;
 * con `usar_id` vincula las propiedades a ese cliente; con `forzar=1` crea igual.
 * @returns {Promise<{ ok: true, cliente: { id: string, nombre: string, telefono: string | null },
 *   propiedades: string[] } | { ok: false, error: string, campos?: any, valores: any, existente?: any }>}
 */
export async function crearClienteRapido(_prev, formData) {
  const valores = {
    ...Object.fromEntries(
      ['nombre', 'apellido', 'telefono', 'rol'].map((k) => [k, formData.get(k)]),
    ),
    propiedad_ids: formData.getAll('propiedad_id'),
  };
  const auth = await assertAdmin();
  if (!auth.ok) return { ...auth, valores };

  const parsed = clienteRapidoSchema.safeParse(valores);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revise los campos marcados.',
      campos: z.flattenError(parsed.error).fieldErrors,
      valores,
    };
  }
  const { nombre, apellido, telefono, rol, propiedad_ids } = parsed.data;
  const { supabase } = auth;

  /* Usar un cliente que ya existe (el que avisó el control de celular repetido) */
  const usarId = uuidSchema.safeParse(formData.get('usar_id'));
  if (usarId.success) {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('id, nombre, telefono')
      .eq('id', usarId.data)
      .maybeSingle();
    if (!cliente) return { ok: false, error: 'Ese cliente ya no existe.', valores };
    const { error } = await vincularVarias(supabase, cliente.id, propiedad_ids, rol);
    if (error) {
      console.error('crearClienteRapido (vincular existente):', error.code, error.message);
      return { ok: false, error: 'No se pudieron vincular las propiedades.', valores };
    }
    revalidarPanel();
    return { ok: true, cliente, propiedades: propiedad_ids };
  }

  if (formData.get('forzar') !== '1') {
    const existente = await clienteConTelefono(supabase, telefono);
    if (existente) {
      return { ok: false, error: 'Ya hay un cliente con ese celular.', valores, existente };
    }
  }

  const { data: cliente, error } = await supabase
    .from('clientes')
    .insert({ nombre: `${nombre} ${apellido}`, telefono })
    .select('id, nombre, telefono')
    .single();
  if (error) {
    console.error('crearClienteRapido (insert):', error.code, error.message);
    return { ok: false, error: 'No se pudo crear. Intente de nuevo.', valores };
  }

  const vinculo = await vincularVarias(supabase, cliente.id, propiedad_ids, rol);
  if (vinculo.error) {
    console.error('crearClienteRapido (vincular):', vinculo.error.code, vinculo.error.message);
    await supabase.from('clientes').delete().eq('id', cliente.id); // que no quede a medias
    return { ok: false, error: 'No se pudieron vincular las propiedades.', valores };
  }
  revalidarPanel();
  return { ok: true, cliente, propiedades: propiedad_ids };
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
   (alta/edición), crearClienteRapido (nombre, celular y propiedades; avisa celular repetido),
   borrarCliente, vincularPropiedad (dueño o comprador; upsert), cambiarEstadoInteres y
   desvincularPropiedad. Solo revalidan el panel. Depende de: lib/auth.js, lib/telefono.js,
   lib/schemas/{campos,cliente}.js */
