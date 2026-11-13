// src/components/admin/image-cropper.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, SkipForward, X, ZoomIn, ZoomOut } from 'lucide-react';
import styles from './image-cropper.module.css';

const RATIO = 3 / 4;
const ZOOM_MAX = 4;
const SALIDA_MAX = 2400;
const PASO = 24;

/**
 * Visor de recorte 4:3 (marco fijo, zoom y arrastre). Devuelve un JPEG recortado vía onConfirm(blob).
 * @param {{ archivo: File, posicion: string, onConfirm: (b: Blob) => void, onSkip: () => void, onCancel: () => void }} props
 */
export default function ImageCropper({ archivo, posicion, onConfirm, onSkip, onCancel }) {
  const dialogRef = useRef(null);
  const marcoRef = useRef(null);
  const imgRef = useRef(null);
  const arrastre = useRef(null);
  const [src, setSrc] = useState('');
  const [dim, setDim] = useState(null); // { iw, ih, fw, fh, base }
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const url = URL.createObjectURL(archivo);
    setSrc(url);
    setDim(null);
    setZoom(1);
    if (dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const escala = dim ? dim.base * zoom : 1;
  const limitar = (p, z = zoom) => {
    if (!dim) return p;
    const dw = dim.iw * dim.base * z;
    const dh = dim.ih * dim.base * z;
    return {
      x: Math.min(0, Math.max(dim.fw - dw, p.x)),
      y: Math.min(0, Math.max(dim.fh - dh, p.y)),
    };
  };

  function alCargar() {
    const img = imgRef.current;
    const fw = marcoRef.current.clientWidth;
    const fh = fw * RATIO;
    const base = Math.max(fw / img.naturalWidth, fh / img.naturalHeight);
    setDim({ iw: img.naturalWidth, ih: img.naturalHeight, fw, fh, base });
    setPos({ x: (fw - img.naturalWidth * base) / 2, y: (fh - img.naturalHeight * base) / 2 });
  }

  /* Zoom manteniendo el centro del marco */
  function cambiarZoom(z) {
    const nz = Math.min(ZOOM_MAX, Math.max(1, z));
    const cx = (dim.fw / 2 - pos.x) / escala;
    const cy = (dim.fh / 2 - pos.y) / escala;
    const ns = dim.base * nz;
    setZoom(nz);
    setPos(limitar({ x: dim.fw / 2 - cx * ns, y: dim.fh / 2 - cy * ns }, nz));
  }

  function teclado(e) {
    const d = {
      ArrowLeft: [PASO, 0],
      ArrowRight: [-PASO, 0],
      ArrowUp: [0, PASO],
      ArrowDown: [0, -PASO],
    }[e.key];
    if (d) {
      e.preventDefault();
      setPos((p) => limitar({ x: p.x + d[0], y: p.y + d[1] }));
    }
    if (e.key === '+' || e.key === '-') cambiarZoom(zoom + (e.key === '+' ? 0.2 : -0.2));
  }

  function confirmar() {
    const sw = dim.fw / escala;
    const sh = dim.fh / escala;
    const w = Math.round(Math.min(sw, SALIDA_MAX));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = Math.round(w * RATIO);
    canvas
      .getContext('2d')
      .drawImage(
        imgRef.current,
        -pos.x / escala,
        -pos.y / escala,
        sw,
        sh,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    canvas.toBlob((b) => b && onConfirm(b), 'image/jpeg', 0.9);
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="crop-title"
      onCancel={(e) => (e.preventDefault(), onCancel())}
    >
      <header className={styles.head}>
        <h2 id="crop-title" className={styles.title}>
          Encuadre la foto <span>{posicion}</span>
        </h2>
        <button
          type="button"
          className={styles.close}
          onClick={onCancel}
          aria-label="Cancelar todas"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      <div
        ref={marcoRef}
        className={styles.frame}
        tabIndex={0}
        role="application"
        aria-label="Arrastre o use las flechas para encuadrar; + y - para el zoom"
        onKeyDown={teclado}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          arrastre.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        }}
        onPointerMove={(e) =>
          arrastre.current &&
          setPos(limitar({ x: e.clientX - arrastre.current.x, y: e.clientY - arrastre.current.y }))
        }
        onPointerUp={() => (arrastre.current = null)}
      >
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={src}
            alt=""
            onLoad={alCargar}
            draggable={false}
            className={styles.img}
            style={
              dim
                ? {
                    width: dim.iw * escala,
                    height: dim.ih * escala,
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                  }
                : { opacity: 0 }
            }
          />
        )}
        <span className={styles.grid} aria-hidden="true" />
      </div>

      <div className={styles.zoom}>
        <button
          type="button"
          onClick={() => cambiarZoom(zoom - 0.2)}
          disabled={!dim}
          aria-label="Alejar"
        >
          <ZoomOut size={18} aria-hidden="true" />
        </button>
        <input
          type="range"
          min="1"
          max={ZOOM_MAX}
          step="0.01"
          value={zoom}
          disabled={!dim}
          onChange={(e) => cambiarZoom(Number(e.target.value))}
          aria-label="Zoom"
        />
        <button
          type="button"
          onClick={() => cambiarZoom(zoom + 0.2)}
          disabled={!dim}
          aria-label="Acercar"
        >
          <ZoomIn size={18} aria-hidden="true" />
        </button>
      </div>

      <footer className={styles.actions}>
        <button type="button" className={styles.skip} onClick={onSkip}>
          <SkipForward size={18} aria-hidden="true" />
          Omitir esta
        </button>
        <button type="button" className={styles.ok} onClick={confirmar} disabled={!dim}>
          <Check size={18} aria-hidden="true" />
          Usar recorte
        </button>
      </footer>
    </dialog>
  );
}

/* RESUMEN
   Visor de recorte (Client Component: canvas, punteros y <dialog>): marco 4:3 fijo con arrastre (mouse,
   táctil y flechas), zoom 1-4x centrado (slider, botones, +/-) y exportación a JPEG 4:3 (máx. 2400px).
   Recibe `archivo`, `posicion` y callbacks onConfirm(blob)/onSkip/onCancel. Depende de: module.css */
