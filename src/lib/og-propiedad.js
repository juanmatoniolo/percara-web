// src/lib/og-propiedad.js
import 'server-only';
import { randomUUID } from 'node:crypto';
import { generarOg } from '@/lib/image-pipeline';
import {
  borrarObjetos,
  claveDesdeUrl,
  claves,
  leerObjeto,
  subirObjeto,
  urlPublica,
} from '@/lib/r2';
import { precioPublico } from '@/lib/format';

/**
 * Regenera la OG 1200x630 de una propiedad a partir de su portada (o la borra si no hay fotos),
 * guarda la URL nueva en og_image_url y elimina la anterior de R2. Nunca se genera al compartir.
 * @param {any} supabase  cliente con sesión de admin
 * @param {{ id: string, titulo: string, precio: number|null, moneda: string, mostrar_precio: boolean,
 *   imagenes: { url: string }[], og_image_url: string|null }} p
 * @returns {Promise<string|null>} nueva og_image_url
 */
export async function regenerarOg(supabase, p) {
  const anterior = claveDesdeUrl(p.og_image_url);
  const clavePortada = claveDesdeUrl(p.imagenes[0]?.url);
  let nueva = null;

  if (clavePortada) {
    const portada = await leerObjeto(clavePortada);
    const og = await generarOg({ portada, titulo: p.titulo, precio: precioPublico(p) });
    const clave = claves.og(p.id, randomUUID());
    await subirObjeto(clave, og, 'image/jpeg');
    nueva = urlPublica(clave);
  }

  const { error } = await supabase
    .from('propiedades')
    .update({ og_image_url: nueva })
    .eq('id', p.id);
  if (error) throw new Error('No se pudo guardar la imagen para compartir.');
  if (anterior) await borrarObjetos([anterior]);
  return nueva;
}

/* RESUMEN
   regenerarOg(supabase, propiedad): lee la portada de R2, genera la OG con image-pipeline, la sube con clave
   nueva (inmutable), actualiza og_image_url y borra la OG anterior; sin fotos deja og_image_url en null.
   Depende de: lib/image-pipeline.js, lib/r2.js, lib/format.js, server-only */
