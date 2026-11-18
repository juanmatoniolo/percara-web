// src/components/property/paginacion.jsx
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { urlListado } from '@/lib/listado';
import LinkPending from '@/components/ui/link-pending';
import styles from './paginacion.module.css';

/**
 * Paginación del listado (Server Component): Anterior / "Página X de Y" / Siguiente, con links reales
 * que conservan los filtros (ciudad, barrio y precio). No se muestra si hay una sola página.
 * @param {{ base: string, pagina: number, totalPaginas: number, filtros?: object }} props
 */
export default function Paginacion({ base, pagina, totalPaginas, filtros = {} }) {
  if (totalPaginas <= 1) return null;
  const href = (n) => urlListado(base, { ...filtros, pagina: n });

  return (
    <nav className={styles.nav} aria-label="Paginación">
      {pagina > 1 ? (
        <Link href={href(pagina - 1)} className={styles.link} rel="prev">
          <ChevronLeft size={18} aria-hidden="true" />
          Anterior
          <LinkPending />
        </Link>
      ) : (
        <span className={styles.spacer} />
      )}
      <p className={styles.estado} aria-current="page">
        Página {pagina} de {totalPaginas}
      </p>
      {pagina < totalPaginas ? (
        <Link href={href(pagina + 1)} className={styles.link} rel="next">
          Siguiente
          <ChevronRight size={18} aria-hidden="true" />
          <LinkPending />
        </Link>
      ) : (
        <span className={styles.spacer} />
      )}
    </nav>
  );
}

/* RESUMEN
   Paginación del listado público (Server Component, sin JS): links Anterior/Siguiente con rel prev/next
   y estado "Página X de Y"; conserva los filtros. Depende de: lib/listado.js, ui/link-pending.jsx, paginacion.module.css */
