// src/components/admin/image-manager.jsx
'use client';

import { useRef, useState, useTransition } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Star, Trash2 } from 'lucide-react';
import ImageCropper from './image-cropper';
import { actualizarImagenes, subirImagen } from '@/actions/images';
import styles from './image-manager.module.css';

const MAX = 20;
const MAX_MB = 10;
const miniatura = (url) => url.replace(/-1600\.webp$/, '-400.webp');

/**
 * Fotos de una propiedad: cola de archivos -> visor 4:3 -> subida de a una; reordenar (arrastrar o
 * flechas), marcar portada y borrar. Cada cambio se guarda al instante.
 * @param {{ propiedadId: string, iniciales: any[] }} props
 */
export default function ImageManager({ propiedadId, iniciales }) {
  const [imagenes, setImagenes] = useState(iniciales);
  const [cola, setCola] = useState([]);
  const [subiendo, setSubiendo] = useState(null);
  const [error, setError] = useState('');
  const [pendiente, startTransition] = useTransition();
  const arrastrado = useRef(null);
  /* Las subidas van en fila: en paralelo, dos lecturas de la misma lista pisarían una foto */
  const fila = useRef(Promise.resolve());
  const libres = MAX - imagenes.length;

  function elegir(e) {
    const archivos = [...e.target.files].filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    setError(
      archivos.length > libres ? `Solo se pueden sumar ${libres} fotos más (máximo ${MAX}).` : '',
    );
    setCola(archivos.slice(0, libres));
  }

  function confirmar(blob) {
    setCola((c) => c.slice(1));
    if (blob.size > MAX_MB * 1024 * 1024) return setError(`La foto recortada supera ${MAX_MB} MB.`);
    setSubiendo((n) => (n ?? 0) + 1);
    const fd = new FormData();
    fd.set('propiedadId', propiedadId);
    fd.set('archivo', new File([blob], 'foto.jpg', { type: 'image/jpeg' }));
    fila.current = fila.current.then(async () => {
      const r = await subirImagen(fd).catch(() => ({
        ok: false,
        error: 'Se cortó la conexión. Intente de nuevo.',
      }));
      setSubiendo((n) => (n > 1 ? n - 1 : null));
      if (r.ok) setImagenes(r.data);
      else setError(r.error);
    });
  }

  function guardarOrden(nuevas) {
    const previas = imagenes;
    setImagenes(nuevas);
    setError('');
    startTransition(async () => {
      const r = await actualizarImagenes(propiedadId, nuevas.map((i) => i.id).filter(Boolean));
      if (r.ok) setImagenes(r.data);
      else (setImagenes(previas), setError(r.error));
    });
  }

  function mover(desde, hasta) {
    if (hasta < 0 || hasta >= imagenes.length || desde === hasta) return;
    const copia = [...imagenes];
    copia.splice(hasta, 0, copia.splice(desde, 1)[0]);
    guardarOrden(copia);
  }

  function borrar(i) {
    if (window.confirm('¿Borrar esta foto? No se puede deshacer.'))
      guardarOrden(imagenes.filter((_, j) => j !== i));
  }

  const ocupado = pendiente || subiendo !== null;

  return (
    <section id="fotos" className={styles.box} aria-labelledby="fotos-title" aria-busy={ocupado}>
      <header className={styles.head}>
        <div>
          <h2 id="fotos-title" className={styles.title}>
            Fotos
          </h2>
          <p className={styles.lead}>
            {imagenes.length} de {MAX}. La primera es la portada (y la imagen al compartir).
            Arrastre para ordenar.
          </p>
        </div>
        <label className={styles.add} data-disabled={libres <= 0 || undefined}>
          <ImagePlus size={18} aria-hidden="true" />
          Sumar fotos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={elegir}
            disabled={libres <= 0}
            className="sr-only"
          />
        </label>
      </header>

      <p className={styles.status} role="status" aria-live="polite">
        {subiendo ? (
          <>
            <LoaderCircle className={styles.spin} size={16} aria-hidden="true" /> Procesando{' '}
            {subiendo} foto(s)…
          </>
        ) : pendiente ? (
          'Guardando…'
        ) : (
          ''
        )}
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {imagenes.length === 0 ? (
        <p className={styles.empty}>Todavía no hay fotos. Sume la primera: será la portada.</p>
      ) : (
        <ol className={styles.grid}>
          {imagenes.map((img, i) => (
            <li
              key={img.id ?? img.url}
              className={styles.item}
              draggable={!ocupado}
              onDragStart={() => (arrastrado.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => mover(arrastrado.current, i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={miniatura(img.url)}
                alt={`Foto ${i + 1}`}
                className={styles.img}
                loading="lazy"
              />
              {i === 0 && <span className={styles.cover}>Portada</span>}
              <div className={styles.tools}>
                <button
                  type="button"
                  onClick={() => mover(i, i - 1)}
                  disabled={ocupado || i === 0}
                  aria-label={`Mover foto ${i + 1} antes`}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 0)}
                  disabled={ocupado || i === 0}
                  aria-label={`Usar foto ${i + 1} como portada`}
                >
                  <Star size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, i + 1)}
                  disabled={ocupado || i === imagenes.length - 1}
                  aria-label={`Mover foto ${i + 1} después`}
                >
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => borrar(i)}
                  disabled={ocupado}
                  aria-label={`Borrar foto ${i + 1}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {cola.length > 0 && (
        <ImageCropper
          archivo={cola[0]}
          posicion={`(${imagenes.length + 1} de ${imagenes.length + cola.length})`}
          onConfirm={confirmar}
          onSkip={() => setCola((c) => c.slice(1))}
          onCancel={() => setCola([])}
        />
      )}
    </section>
  );
}

/* RESUMEN
   Gestor de fotos (Client Component): elige varias, las pasa una por una por el visor 4:3 y las sube con
   subirImagen; grilla ordenable (arrastrar o flechas), portada con estrella y borrado, guardado al instante
   con actualizarImagenes. Recibe `propiedadId` e `iniciales`. Depende de: image-cropper.jsx, actions/images.js */
