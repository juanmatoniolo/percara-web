// src/lib/subir-fotos.js
import { subirImagen } from '@/actions/images';

/**
 * Sube en orden (de a una, nunca en paralelo: cada subida lee y reescribe la lista de la propiedad)
 * las fotos recortadas del alta. Avisa el avance con `onProgreso(actual, total)`.
 * @param {string} propiedadId
 * @param {{ blob: Blob }[]} fotos
 * @param {(actual: number, total: number) => void} [onProgreso]
 * @returns {Promise<{ subidas: number, fallidas: number }>}
 */
export async function subirFotos(propiedadId, fotos, onProgreso) {
  let subidas = 0;
  for (const [i, f] of fotos.entries()) {
    onProgreso?.(i + 1, fotos.length);
    const fd = new FormData();
    fd.set('propiedadId', propiedadId);
    fd.set('archivo', new File([f.blob], 'foto.jpg', { type: 'image/jpeg' }));
    const r = await subirImagen(fd).catch(() => ({ ok: false }));
    if (r.ok) subidas += 1;
  }
  return { subidas, fallidas: fotos.length - subidas };
}

/* RESUMEN
   Subida secuencial de las fotos del alta (se usa en el cliente, desde property-form): llama a la Server
   Action subirImagen por cada foto y devuelve cuántas subieron y cuántas fallaron.
   Depende de: actions/images.js */
