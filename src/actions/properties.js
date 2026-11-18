// src/actions/properties.js
'use server';

import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertAdmin } from '@/lib/auth';
import { TAG_PROPIEDADES } from '@/lib/supabase/public';
import {
  aFila,
  desdeFormData,
  estadoSchema,
  propiedadSchema,
  uuidSchema,
} from '@/lib/schemas/propiedad';
import { slugify } from '@/lib/slug';
import { canonico } from '@/lib/lugares';
import { borrarPrefijo, claves } from '@/lib/r2';
import { regenerarOg } from '@/lib/og-propiedad';

/* Campos que aparecen en la imagen OG: si cambian, se regenera */
const CAMPOS_OG = ['titulo', 'precio', 'moneda', 'mostrar_precio'];

/** Invalida el sitio público (ISR) y el panel. */
function revalidarTodo() {
  revalidateTag(TAG_PROPIEDADES);
  revalidatePath('/dashboard', 'layout');
}

/**
 * Localidad y barrio escritos igual que los ya cargados ("chajari" -> "Chajarí"; el barrio se compara
 * dentro de su localidad). Sin la migración 009 (sin provincia/barrio) quita esas claves.
 */
async function unificarLugar(supabase, fila) {
  const r = await supabase.from('propiedades').select('localidad, barrio');
  if (r.error?.code === '42703') {
    const { data } = await supabase.from('propiedades').select('localidad');
    const { provincia, barrio, ...resto } = fila;
    return { ...resto, localidad: canonico(fila.localidad, unicos(data, 'localidad')) };
  }
  const filas = r.data ?? [];
  const localidad = canonico(fila.localidad, unicos(filas, 'localidad'));
  const deLaLocalidad = filas.filter((f) => f.localidad === localidad);
  return { ...fila, localidad, barrio: canonico(fila.barrio, unicos(deLaLocalidad, 'barrio')) };
}

const unicos = (filas, k) => [...new Set((filas ?? []).map((f) => f[k]).filter(Boolean))];

/** Slug único: base, base-2, base-3... */
async function slugUnico(supabase, titulo) {
  const base = slugify(titulo) || 'propiedad';
  const { data } = await supabase.from('propiedades').select('slug').like('slug', `${base}%`);
  const usados = new Set((data ?? []).map((r) => r.slug));
  if (!usados.has(base)) return base;
  let n = 2;
  while (usados.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/**
 * Alta o edición. Con `id` en el form actualiza y redirige al listado; sin `id` crea y devuelve
 * `{ ok: true, id }` (el formulario sube las fotos y abre la edición). El slug se genera al crear y no
 * cambia al editar, para no romper links compartidos.
 * En error devuelve `valores` para que el formulario no pierda lo escrito (React 19 resetea el form).
 * @returns {Promise<{ ok: true, id: string } | { ok: false, error: string, campos?: Record<string, string[]>, valores?: object }>}
 */
export async function guardarPropiedad(_prev, formData) {
  const valores = desdeFormData(formData);
  const auth = await assertAdmin();
  if (!auth.ok) return { ...auth, valores };

  const parsed = propiedadSchema.safeParse(valores);
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
  const fila = await unificarLugar(supabase, aFila(parsed.data));

  if (id) {
    if (!uuidSchema.safeParse(id).success)
      return { ok: false, error: 'Propiedad inválida.', valores };
    const { data: antes } = await supabase
      .from('propiedades')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!antes) return { ok: false, error: 'Propiedad no encontrada.', valores };

    const { error } = await supabase.from('propiedades').update(fila).eq('id', id);
    if (error) {
      console.error('guardarPropiedad (update):', error.code, error.message);
      return { ok: false, error: 'No se pudo guardar. Intente de nuevo.', valores };
    }

    const cambioOg = CAMPOS_OG.some((k) => String(antes[k]) !== String(fila[k]));
    if (cambioOg && antes.imagenes?.length) {
      try {
        await regenerarOg(supabase, { ...antes, ...fila });
      } catch {
        /* La propiedad ya se guardó; la OG anterior sigue sirviendo hasta el próximo guardado */
      }
    }
    revalidarTodo();
    redirect('/dashboard/propiedades?aviso=guardada');
  }

  const slug = await slugUnico(supabase, parsed.data.titulo);
  const { data: creada, error } = await supabase
    .from('propiedades')
    .insert({ ...fila, slug })
    .select('id')
    .single();
  if (error) {
    console.error('guardarPropiedad (insert):', error.code, error.message);
    return {
      ok: false,
      error:
        error.code === '23505'
          ? 'Ya existe una propiedad con ese título.'
          : 'No se pudo crear. Intente de nuevo.',
      valores,
    };
  }
  revalidarTodo();
  /* Alta: devuelve el id para que el formulario suba las fotos elegidas (necesitan el id para su
     carpeta en R2) y recién después abra la edición. */
  return { ok: true, id: creada.id };
}

/** Cambia el estado (borrador / publicada / vendida). Form con inputs `id` y `estado`. */
export async function cambiarEstado(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const id = uuidSchema.safeParse(formData.get('id'));
  const estado = estadoSchema.safeParse(formData.get('estado'));
  if (!id.success || !estado.success) return { ok: false, error: 'Datos inválidos.' };

  const { error } = await auth.supabase
    .from('propiedades')
    .update({ estado: estado.data })
    .eq('id', id.data);
  if (error) return { ok: false, error: 'No se pudo cambiar el estado.' };
  revalidarTodo();
  return { ok: true };
}

/** Días que una vendida sigue visible en el sitio (el trigger de la base usa el mismo plazo). */
const DIAS_VENDIDA = 60;

/**
 * Renueva la visibilidad de una vendida: vuelve a contar 60 días desde hoy. Solo actúa si está
 * vendida (el trigger de la base limpia la fecha en cualquier otro estado). Form con input `id`.
 */
export async function renovarVendida(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const id = uuidSchema.safeParse(formData.get('id'));
  if (!id.success) return { ok: false, error: 'Datos inválidos.' };

  const hasta = new Date(Date.now() + DIAS_VENDIDA * 864e5).toISOString();
  const { error } = await auth.supabase
    .from('propiedades')
    .update({ vendida_hasta: hasta })
    .eq('id', id.data)
    .eq('estado', 'vendida');
  if (error) return { ok: false, error: 'No se pudo renovar.' };
  revalidarTodo();
  return { ok: true };
}

/** Marca o desmarca como destacada. Form con inputs `id` y `destacada` ('true'/'false'). */
export async function alternarDestacada(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const id = uuidSchema.safeParse(formData.get('id'));
  if (!id.success) return { ok: false, error: 'Datos inválidos.' };

  const destacada = formData.get('destacada') === 'true';
  const { error } = await auth.supabase.from('propiedades').update({ destacada }).eq('id', id.data);
  if (error) return { ok: false, error: 'No se pudo actualizar.' };
  revalidarTodo();
  return { ok: true };
}

/** Borra la propiedad. Form con input `id`. */
export async function borrarPropiedad(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  const id = uuidSchema.safeParse(formData.get('id'));
  if (!id.success) return { ok: false, error: 'Datos inválidos.' };

  const { error } = await auth.supabase.from('propiedades').delete().eq('id', id.data);
  if (error) return { ok: false, error: 'No se pudo borrar.' };
  /* Sin huérfanos: borra la carpeta completa en R2 (variantes de todas las fotos + OG) */
  try {
    await borrarPrefijo(claves.carpeta(id.data));
  } catch {
    console.error('borrarPropiedad: no se pudo limpiar R2', id.data);
  }
  revalidarTodo();
  redirect('/dashboard/propiedades?aviso=borrada');
}

/* RESUMEN
   Server Actions de propiedades (cada una verifica admin con assertAdmin y valida con Zod): guardarPropiedad
   (unifica localidad y barrio con los ya cargados; alta con slug único -> devuelve el id para subir las fotos; edición regenera la OG si cambian título o precio), cambiarEstado,
   renovarVendida (60 días más visible en el sitio), alternarDestacada y borrarPropiedad (borra también su carpeta en R2). Invalidan el tag 'propiedades'.
   Depende de: lib/{auth,slug,r2,og-propiedad,lugares}.js, lib/schemas/propiedad.js, supabase/public.js */
