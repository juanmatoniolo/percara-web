// src/actions/images.js
'use server';

import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { assertAdmin } from '@/lib/auth';
import { TAG_PROPIEDADES } from '@/lib/supabase/public';
import { ANCHOS, MAX_BYTES, MAX_IMAGENES, procesarImagen, tipoReal } from '@/lib/image-pipeline';
import { borrarObjetos, claves, subirObjeto, urlPublica } from '@/lib/r2';
import { regenerarOg } from '@/lib/og-propiedad';

const uuid = z.string().uuid();
const CAMPOS = 'id, titulo, precio, moneda, mostrar_precio, imagenes, og_image_url';

async function cargar(supabase, id) {
  const { data } = await supabase.from('propiedades').select(CAMPOS).eq('id', id).maybeSingle();
  return data ? { ...data, imagenes: Array.isArray(data.imagenes) ? data.imagenes : [] } : null;
}

async function guardar(supabase, p, imagenes, { portadaCambio }) {
  const ordenadas = imagenes.map((img, i) => ({ ...img, orden: i }));
  const { error } = await supabase
    .from('propiedades')
    .update({ imagenes: ordenadas })
    .eq('id', p.id);
  if (error) throw new Error('No se pudieron guardar las fotos.');
  if (portadaCambio) await regenerarOg(supabase, { ...p, imagenes: ordenadas });
  revalidateTag(TAG_PROPIEDADES);
  revalidatePath(`/dashboard/propiedades/${p.id}`);
  return ordenadas;
}

/**
 * Sube UNA foto ya recortada en el visor 4:3 (FormData: propiedadId, archivo).
 * Valida magic bytes, tamaño y cupo; genera 400/900/1600 WebP + blur y la suma al final.
 */
export async function subirImagen(formData) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  try {
    const id = uuid.safeParse(formData.get('propiedadId'));
    const archivo = formData.get('archivo');
    if (!id.success || !(archivo instanceof File)) return { ok: false, error: 'Datos inválidos.' };
    if (archivo.size > MAX_BYTES) return { ok: false, error: 'La foto supera los 10 MB.' };

    const buffer = Buffer.from(await archivo.arrayBuffer());
    if (!tipoReal(buffer))
      return { ok: false, error: 'Formato no admitido (use JPG, PNG o WebP).' };

    const p = await cargar(auth.supabase, id.data);
    if (!p) return { ok: false, error: 'Propiedad no encontrada.' };
    if (p.imagenes.length >= MAX_IMAGENES)
      return { ok: false, error: `Máximo ${MAX_IMAGENES} fotos por propiedad.` };

    const { variantes, blur } = await procesarImagen(buffer);
    const imagenId = randomUUID();
    await Promise.all(
      variantes.map((v, i) =>
        subirObjeto(claves.variante(p.id, imagenId, ANCHOS[i]), v.buffer, 'image/webp'),
      ),
    );
    const mayor = variantes[variantes.length - 1];
    const nueva = {
      id: imagenId,
      url: urlPublica(claves.variante(p.id, imagenId, ANCHOS[ANCHOS.length - 1])),
      alt: p.titulo,
      orden: p.imagenes.length,
      ancho: mayor.ancho,
      alto: mayor.alto,
      blur,
    };

    const data = await guardar(auth.supabase, p, [...p.imagenes, nueva], {
      portadaCambio: p.imagenes.length === 0,
    });
    return { ok: true, data };
  } catch (e) {
    console.error('subirImagen:', e?.name ?? 'error');
    return { ok: false, error: 'No se pudo procesar la foto. Intente con otra.' };
  }
}

/**
 * Reordena y/o quita fotos. `ids` es el orden final (la primera es la portada); las que faltan se
 * borran de R2. Regenera la OG si cambió la portada.
 * @param {string} propiedadId @param {string[]} ids
 */
export async function actualizarImagenes(propiedadId, ids) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;
  try {
    const pid = uuid.safeParse(propiedadId);
    const lista = z.array(uuid).max(MAX_IMAGENES).safeParse(ids);
    if (!pid.success || !lista.success) return { ok: false, error: 'Datos inválidos.' };

    const p = await cargar(auth.supabase, pid.data);
    if (!p) return { ok: false, error: 'Propiedad no encontrada.' };

    const porId = new Map(p.imagenes.map((img) => [img.id, img]));
    const finales = lista.data.filter((i) => porId.has(i)).map((i) => porId.get(i));
    const quitadas = p.imagenes.filter((img) => img.id && !lista.data.includes(img.id));

    const data = await guardar(auth.supabase, p, finales, {
      portadaCambio: p.imagenes[0]?.id !== finales[0]?.id,
    });
    await borrarObjetos(
      quitadas.flatMap((img) => ANCHOS.map((w) => claves.variante(p.id, img.id, w))),
    );
    return { ok: true, data };
  } catch (e) {
    console.error('actualizarImagenes:', e?.name ?? 'error');
    return { ok: false, error: 'No se pudieron actualizar las fotos.' };
  }
}

/* RESUMEN
   Server Actions de fotos (verifican admin): subirImagen (una foto recortada: magic bytes, 10 MB, máx. 20,
   Sharp 400/900/1600 WebP + blur, R2 inmutable con uuid) y actualizarImagenes (orden/portada/borrado con
   limpieza en R2). Regeneran la OG si cambia la portada e invalidan el ISR. Depende de: lib/{auth,image-
   pipeline,r2,og-propiedad}.js, supabase/public.js */
