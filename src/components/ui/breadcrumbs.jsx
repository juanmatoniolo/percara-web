// src/components/ui/breadcrumbs.jsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from './breadcrumbs.module.css';

/**
 * Migas de pan visibles. El último ítem es la página actual (sin link).
 * @param {{ items: { nombre: string, path: string }[] }} props
 */
export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Migas de pan">
      <ol className={styles.list}>
        {items.map(({ nombre, path }, i) => {
          const ultimo = i === items.length - 1;
          return (
            <li key={path} className={styles.item}>
              {ultimo ? (
                <span aria-current="page" className={styles.current}>
                  {nombre}
                </span>
              ) : (
                <>
                  <Link href={path} className={styles.link}>
                    {nombre}
                  </Link>
                  <ChevronRight className={styles.sep} size={14} aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* RESUMEN
   Migas de pan (Server Component). Recibe `items` [{ nombre, path }] (los mismos que el JSON-LD
   BreadcrumbList); el último se marca como página actual. Depende de: breadcrumbs.module.css */
