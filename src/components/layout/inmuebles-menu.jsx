// src/components/layout/inmuebles-menu.jsx
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import styles from './inmuebles-menu.module.css';

/**
 * Menú desplegable "Inmuebles" del header de escritorio.
 * @param {{ categorias: { slug: string, nombre: string }[] }} props
 */
export default function InmueblesMenu({ categorias }) {
  const ref = useRef(null);
  const pathname = usePathname();
  const active = pathname.startsWith('/propiedades') || pathname.startsWith('/categorias');

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    function close(e) {
      const el = ref.current;
      if (!el?.open) return;
      if (e.type === 'keydown' && e.key !== 'Escape') return;
      if (e.type === 'pointerdown' && el.contains(e.target)) return;
      el.open = false;
      if (e.type === 'keydown') el.querySelector('summary')?.focus();
    }
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, []);

  return (
    <details ref={ref} className={styles.menu}>
      <summary className={styles.trigger} data-active={active || undefined}>
        Inmuebles
        <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
      </summary>
      <ul className={styles.panel}>
        <li>
          <Link href="/propiedades" className={`${styles.link} ${styles.all}`}>
            Todas las propiedades
          </Link>
        </li>
        {categorias.map(({ slug, nombre }) => (
          <li key={slug}>
            <Link href={`/categorias/${slug}`} className={styles.link}>
              {nombre}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

/* RESUMEN
   Desplegable "Inmuebles" (Client Component) basado en <details>: lista todas las propiedades y
   las categorías. Se cierra al navegar, al hacer clic afuera o con Escape. Recibe `categorias`.
   Depende de: inmuebles-menu.module.css, next/link, next/navigation, lucide-react */
