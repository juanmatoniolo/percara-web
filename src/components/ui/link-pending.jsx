// src/components/ui/link-pending.jsx
'use client';

import { useLinkStatus } from 'next/link';
import styles from './link-pending.module.css';

/**
 * Indicador de carga para el <Link> que lo contiene (útil con mala conexión): mientras la navegación
 * está pendiente muestra un spinner. Aparece con un pequeño retraso para no parpadear en conexiones
 * rápidas. Debe renderizarse DENTRO de un <Link>.
 * @param {{ variante?: 'cubre' | 'linea' }} props  cubre = velo sobre la foto; linea = spinner chico
 */
export default function LinkPending({ variante = 'linea' }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span className={styles[variante]} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span className="sr-only">Cargando…</span>
    </span>
  );
}

/* RESUMEN
   Indicador de navegación pendiente (Client Component mínimo, useLinkStatus de Next 15.3+): velo con
   spinner sobre la foto de una card o spinner en línea en botones de paginación. Recibe `variante`.
   Depende de: next/link, link-pending.module.css */
