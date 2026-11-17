// src/components/property/gallery-controls.jsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './property-gallery.module.css';

/**
 * Controles de la galería (Client Component): flechas, miniaturas y teclado sobre el carrusel que llega
 * renderizado del servidor como `children` (así las fotos y la LCP no dependen de este JS).
 * @param {{ miniaturas: { url: string, alt: string }[], children: import('react').ReactNode }} props
 */
export default function GalleryControls({ miniaturas, children }) {
  const caja = useRef(null);
  const tira = useRef(null);
  const [actual, setActual] = useState(0);
  const total = miniaturas.length;

  const ir = useCallback((i) => {
    const t = caja.current?.querySelector('ul');
    const items = t?.children;
    if (!items?.length) return;
    const destino = Math.max(0, Math.min(items.length - 1, i));
    t.scrollTo({ left: items[destino].offsetLeft - items[0].offsetLeft });
  }, []);

  /* Foto actual según el scroll (funciona igual si el usuario desliza con el dedo o el trackpad) */
  useEffect(() => {
    const t = caja.current?.querySelector('ul');
    if (!t) return undefined;
    const alScroll = () => {
      const items = t.children;
      const paso = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : 1;
      setActual(Math.round(t.scrollLeft / paso));
    };
    t.addEventListener('scroll', alScroll, { passive: true });
    return () => t.removeEventListener('scroll', alScroll);
  }, []);

  /* Mantiene visible la miniatura activa dentro de su tira (sin mover la página) */
  useEffect(() => {
    const t = tira.current;
    const m = t?.children[actual];
    if (!m) return;
    if (
      m.offsetLeft < t.scrollLeft ||
      m.offsetLeft + m.offsetWidth > t.scrollLeft + t.clientWidth
    ) {
      t.scrollTo({ left: m.offsetLeft - (t.clientWidth - m.offsetWidth) / 2 });
    }
  }, [actual]);

  const teclado = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      ir(actual + (e.key === 'ArrowRight' ? 1 : -1));
    }
  };

  return (
    <div className={styles.controles} onKeyDown={teclado}>
      <div className={styles.escenario} ref={caja}>
        {children}
        <button
          type="button"
          className={`${styles.flecha} ${styles.anterior}`}
          onClick={() => ir(actual - 1)}
          disabled={actual === 0}
          aria-label="Foto anterior"
        >
          <ChevronLeft size={28} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${styles.flecha} ${styles.siguiente}`}
          onClick={() => ir(actual + 1)}
          disabled={actual >= total - 1}
          aria-label="Foto siguiente"
        >
          <ChevronRight size={28} aria-hidden="true" />
        </button>
      </div>

      <ol className={styles.tira} ref={tira} aria-label="Elegir foto">
        {miniaturas.map((m, i) => (
          <li key={m.url}>
            <button
              type="button"
              className={styles.mini}
              onClick={() => ir(i)}
              aria-label={`Ver foto ${i + 1} de ${total}`}
              aria-current={i === actual ? 'true' : undefined}
            >
              <Image src={m.url} alt="" fill sizes="96px" className={styles.img} />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* RESUMEN
   Controles de la galería del detalle (Client Component): flechas anterior/siguiente sobre la foto,
   tira de miniaturas clickeables con la actual marcada y flechas del teclado. Sigue el scroll del
   carrusel (children, renderizado en servidor). Recibe `miniaturas` y `children`.
   Depende de: property-gallery.module.css, next/image (loader de variantes R2) */
