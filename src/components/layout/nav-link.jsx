// src/components/layout/nav-link.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Enlace de navegación que marca la ruta actual con aria-current="page".
 * El estilo activo lo define quien lo usa, vía el selector [aria-current='page'].
 * @param {{ href: string, className?: string, exact?: boolean, children: import('react').ReactNode }} props
 */
export default function NavLink({ href, className, exact = false, children }) {
  const pathname = usePathname();
  const active = href === '/' || exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link href={href} className={className} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  );
}

/* RESUMEN
   Enlace de navegación (Client Component mínimo). Recibe `href`, `className`, `exact` y `children`;
   agrega aria-current="page" si la ruta coincide (exacta para "/" o con `exact`, por prefijo si no).
   Depende de: next/link, next/navigation */
