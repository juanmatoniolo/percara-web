// src/components/layout/nav-link.jsx
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Enlace de navegación que marca la ruta actual con aria-current="page".
 * El estilo activo lo define quien lo usa, vía el selector [aria-current='page'].
 * Con `alVista`, si está activo y su lista se desliza de costado, la mueve para que se vea (sin mover la página).
 * @param {{ href: string, className?: string, exact?: boolean, alVista?: boolean,
 *   children: import('react').ReactNode }} props
 */
export default function NavLink({ href, className, exact = false, alVista = false, children }) {
  const pathname = usePathname();
  const active = href === '/' || exact ? pathname === href : pathname.startsWith(href);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const lista = el?.closest('ul');
    if (!alVista || !active || !lista || lista.scrollWidth <= lista.clientWidth) return;
    lista.scrollLeft = el.offsetLeft - (lista.clientWidth - el.offsetWidth) / 2;
  }, [alVista, active]);

  return (
    <Link ref={ref} href={href} className={className} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  );
}

/* RESUMEN
   Enlace de navegación (Client Component mínimo). Recibe `href`, `className`, `exact` y `children`;
   agrega aria-current="page" si la ruta coincide (exacta para "/" o con `exact`, por prefijo si no).
   Con `alVista` centra el link activo en su lista deslizable (solapas del panel en móvil).
   Depende de: next/link, next/navigation */
