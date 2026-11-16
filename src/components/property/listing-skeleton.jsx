// src/components/property/listing-skeleton.jsx
import grid from './property-grid.module.css';
import styles from './listing-skeleton.module.css';

const CARDS = 6;

/**
 * Esqueleto del listado mientras llegan los datos (conexión lenta): encabezado y 6 cards con brillo.
 * Lo usan los loading.jsx de /propiedades y /categorias/[categoria].
 */
export default function ListingSkeleton() {
  return (
    <div className={styles.page} role="status" aria-busy="true">
      <span className="sr-only">Cargando propiedades…</span>
      <div className={styles.head} aria-hidden="true">
        <div className={styles.inner}>
          <span className={`${styles.bar} ${styles.miga}`} />
          <span className={`${styles.bar} ${styles.titulo}`} />
          <span className={`${styles.bar} ${styles.bajada}`} />
        </div>
      </div>
      <div className={styles.inner} aria-hidden="true">
        <ul className={grid.grid}>
          {Array.from({ length: CARDS }, (_, i) => (
            <li key={i} className={styles.card}>
              <span className={styles.media} />
              <span className={`${styles.bar} ${styles.precio}`} />
              <span className={`${styles.bar} ${styles.linea}`} />
              <span className={`${styles.bar} ${styles.corta}`} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* RESUMEN
   Esqueleto de carga del listado (Server Component, sin JS): migas, título y bajada simulados y una grilla
   de 6 cards 4:3 con brillo animado. Accesible como role="status". Depende de: property-grid.module.css,
   listing-skeleton.module.css */
