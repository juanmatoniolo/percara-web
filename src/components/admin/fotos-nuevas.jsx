// src/components/admin/fotos-nuevas.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Star, Trash2 } from 'lucide-react';
import ImageCropper from './image-cropper';
import styles from './image-manager.module.css';

export const MAX_FOTOS = 20;
const MAX_MB = 10;

/**
 * Fotos del alta de propiedad: se recortan en el visor 4:3 y quedan en el navegador (con vista previa)
 * hasta que se crea la propiedad; ahí el formulario las sube en orden. Reordenar, portada y borrar.
 * @param {{ fotos: { id: string, blob: Blob, url: string }[], onChange: (f: any[]) => void,
 *   progreso?: { actual: number, total: number } | null, bloqueado?: boolean }} props
 */
export default function FotosNuevas({ fotos, onChange, progreso = null, bloqueado = false }) {
  const [cola, setCola] = useState([]);
  const [error, setError] = useState('');
  const arrastrado = useRef(null);
  const urls = useRef(new Set());
  const libres = MAX_FOTOS - fotos.length;

  /* Libera las vistas previas al salir de la página */
  useEffect(() => {
    const set = urls.current;
    return () => set.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  function elegir(e) {
    const archivos = [...e.target.files].filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    setError(
      archivos.length > libres
        ? `Solo se pueden sumar ${libres} fotos más (máximo ${MAX_FOTOS}).`
        : '',
    );
    setCola(archivos.slice(0, libres));
  }

  function confirmar(blob) {
    setCola((c) => c.slice(1));
    if (blob.size > MAX_MB * 1024 * 1024) return setError(`La foto recortada supera ${MAX_MB} MB.`);
    const url = URL.createObjectURL(blob);
    urls.current.add(url);
    onChange([...fotos, { id: crypto.randomUUID(), blob, url }]);
  }

  function mover(desde, hasta) {
    if (hasta < 0 || hasta >= fotos.length || desde === hasta) return;
    const copia = [...fotos];
    copia.splice(hasta, 0, copia.splice(desde, 1)[0]);
    onChange(copia);
  }

  function borrar(i) {
    URL.revokeObjectURL(fotos[i].url);
    urls.current.delete(fotos[i].url);
    onChange(fotos.filter((_, j) => j !== i));
  }

  return (
    <section className={styles.box} aria-labelledby="fotos-nuevas-title" aria-busy={bloqueado}>
      <header className={styles.head}>
        <div>
          <h2 id="fotos-nuevas-title" className={styles.title}>
            Fotos
          </h2>
          <p className={styles.lead}>
            {fotos.length} de {MAX_FOTOS}. La primera es la portada. Se suben al crear la propiedad.
          </p>
        </div>
        <label className={styles.add} data-disabled={libres <= 0 || bloqueado || undefined}>
          <ImagePlus size={18} aria-hidden="true" />
          Sumar fotos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={elegir}
            disabled={libres <= 0 || bloqueado}
            className="sr-only"
          />
        </label>
      </header>

      <p className={styles.status} role="status" aria-live="polite">
        {progreso && (
          <>
            <LoaderCircle className={styles.spin} size={16} aria-hidden="true" />
            Subiendo foto {progreso.actual} de {progreso.total}…
          </>
        )}
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {fotos.length === 0 ? (
        <p className={styles.empty}>Sume las fotos ahora o más tarde desde la edición.</p>
      ) : (
        <ol className={styles.grid}>
          {fotos.map((f, i) => (
            <li
              key={f.id}
              className={styles.item}
              draggable={!bloqueado}
              onDragStart={() => (arrastrado.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => mover(arrastrado.current, i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={`Foto ${i + 1}`} className={styles.img} />
              {i === 0 && <span className={styles.cover}>Portada</span>}
              <div className={styles.tools}>
                <button
                  type="button"
                  onClick={() => mover(i, i - 1)}
                  disabled={bloqueado || i === 0}
                  aria-label={`Mover foto ${i + 1} antes`}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 0)}
                  disabled={bloqueado || i === 0}
                  aria-label={`Usar foto ${i + 1} como portada`}
                >
                  <Star size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, i + 1)}
                  disabled={bloqueado || i === fotos.length - 1}
                  aria-label={`Mover foto ${i + 1} después`}
                >
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => borrar(i)}
                  disabled={bloqueado}
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
          posicion={`(${fotos.length + 1} de ${fotos.length + cola.length})`}
          onConfirm={confirmar}
          onSkip={() => setCola((c) => c.slice(1))}
          onCancel={() => setCola([])}
        />
      )}
    </section>
  );
}

/* RESUMEN
   Fotos del alta (Client Component): elige varias, las pasa por el visor 4:3 y las guarda en el navegador
   con vista previa (object URL), ordenables, con portada y borrado. No sube nada: el formulario las sube
   tras crear la propiedad. Recibe `fotos`, `onChange`, `progreso`, `bloqueado`.
   Depende de: image-cropper.jsx, image-manager.module.css */
