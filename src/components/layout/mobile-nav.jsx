// src/components/layout/mobile-nav.jsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import NavLink from './nav-link';
import styles from './mobile-nav.module.css';

export default function MobileNav({ links }) {
  const ref = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  /* Las anclas (/#contacto) no cambian la ruta: cerrar también al tocar cualquier link */
  function closeOnLink(e) {
    if (e.target.closest('a') && ref.current) ref.current.open = false;
  }

  return (
    <details ref={ref} className={styles.menu}>
      <summary className={styles.trigger}>
        <Menu className={styles.open} size={22} aria-hidden="true" />
        <X className={styles.close} size={22} aria-hidden="true" />
        <span className="sr-only">Menú</span>
      </summary>
      <nav className={styles.panel} aria-label="Principal" onClick={closeOnLink}>
        <ul>
          {links.map(({ href, label }, i) => (
            <li key={href} className={styles.item} style={{ '--i': i }}>
              <NavLink href={href} className={styles.link}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}

/* RESUMEN
   Menú móvil (Client Component) basado en <details>. Recibe `links` ([{ href, label }]), marca la
   ruta activa con NavLink, alterna icono menú/cerrar y se cierra al cambiar de ruta o al tocar un
   link (incluidas las anclas #sobre-nosotros y #contacto).
   Depende de: nav-link.jsx, mobile-nav.module.css, lucide-react */
