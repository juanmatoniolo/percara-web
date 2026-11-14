// src/app/error.jsx
'use client';

import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import styles from './not-found.module.css';

/**
 * Error inesperado al renderizar una página (Client Component: lo exige Next para usar `reset`).
 * No muestra detalles técnicos al visitante.
 * @param {{ reset: () => void }} props
 */
export default function ErrorPage({ reset }) {
  return (
    <main id="contenido" className={styles.page}>
      <h1 className={styles.title}>Algo salió mal</h1>
      <p className={styles.lead}>
        No pudimos cargar esta página. Intente de nuevo en unos segundos.
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={() => reset()} className={styles.primary}>
          <RotateCcw size={18} aria-hidden="true" />
          Reintentar
        </button>
        <Link href="/" className={styles.secondary}>
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}

/* RESUMEN
   Límite de error de la app (Client Component): mensaje claro sin detalles internos, botón "Reintentar"
   (reset de Next) e ir al inicio. Recibe `reset`. Depende de: not-found.module.css, lucide-react */
