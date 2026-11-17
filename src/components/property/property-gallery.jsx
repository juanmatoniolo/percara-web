// src/components/property/property-gallery.jsx
import Image from 'next/image';
import { iconoCategoria } from '@/lib/categories-meta';
import GalleryControls from './gallery-controls';
import styles from './property-gallery.module.css';

const SIZES = '(min-width: 1024px) 60vw, 100vw';

/**
 * Galería 4:3 deslizable con snap (sin JS). La primera imagen es la LCP de la página.
 * @param {{ imagenes: import('@/types').ImagenPropiedad[], titulo: string, categoriaSlug: string }} props
 */
export default function PropertyGallery({ imagenes, titulo, categoriaSlug }) {
  if (imagenes.length === 0) {
    const Icono = iconoCategoria(categoriaSlug);
    return (
      <div className={`${styles.frame} ${styles.placeholder}`} aria-hidden="true">
        <Icono size={72} strokeWidth={1} />
      </div>
    );
  }

  const carrusel = (
    <ul className={styles.track} tabIndex={0} aria-label="Fotos (use las flechas para cambiar)">
      {imagenes.map((img, i) => (
        <li key={img.url} className={styles.frame}>
          <Image
            src={img.url}
            alt={img.alt || `${titulo}, foto ${i + 1}`}
            fill
            sizes={SIZES}
            priority={i === 0}
            className={styles.img}
            {...(img.blur ? { placeholder: 'blur', blurDataURL: img.blur } : {})}
          />
          {imagenes.length > 1 && (
            <span className={styles.counter} aria-hidden="true">
              {i + 1} / {imagenes.length}
            </span>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <section className={styles.gallery} aria-label={`Fotos de ${titulo}`}>
      {imagenes.length > 1 ? (
        <GalleryControls miniaturas={imagenes.map((img) => ({ url: img.url, alt: img.alt }))}>
          {carrusel}
        </GalleryControls>
      ) : (
        carrusel
      )}
    </section>
  );
}

/* RESUMEN
   Galería del detalle (Server Component): carrusel horizontal 4:3 con scroll-snap y contador por foto;
   `priority` solo en la primera (LCP). Con más de una foto suma flechas, miniaturas y teclado
   (gallery-controls.jsx). Sin imágenes muestra un placeholder con el ícono de la categoría.
   Recibe `imagenes`, `titulo`, `categoriaSlug`. Depende de: lib/categories-meta.js, gallery-controls.jsx,
   module.css */
