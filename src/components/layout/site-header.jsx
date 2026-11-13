// src/components/layout/site-header.jsx
import Link from 'next/link';
import { CATEGORIAS } from '@/lib/queries/categories';
import InmueblesMenu from './inmuebles-menu';
import MobileNav from './mobile-nav';
import styles from './site-header.module.css';

/* "Sobre nosotros" y "Contacto" son anclas a secciones de la home: desde cualquier página
   llevan a "/" y se desplazan suavemente hasta el id (scroll-behavior: smooth). */
const ANCLAS = [
  { href: '/#sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/#contacto', label: 'Contacto' },
];

const LINKS_MOVIL = [
  { href: '/', label: 'Inicio' },
  { href: '/propiedades', label: 'Inmuebles' },
  ...ANCLAS,
];

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* TODO: reemplazar por el logo (casa con trazo verde) cuando esté en /public */}
        <Link
          href="/"
          className={styles.brand}
          aria-label="Percara Negocios Inmobiliarios, ir al inicio"
        >
          Percara <span className={styles.brandSub}>Negocios Inmobiliarios</span>
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          <ul className={styles.list}>
            <li>
              <InmueblesMenu categorias={CATEGORIAS} />
            </li>
            {ANCLAS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={styles.link}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <MobileNav links={LINKS_MOVIL} />
        </div>
      </div>
      <span className={styles.progress} aria-hidden="true" />
    </header>
  );
}

/* RESUMEN
   Header fijo (Server Component): marca, desplegable "Inmuebles" con categorías, anclas suaves a
   #sobre-nosotros y #contacto de la home, menú móvil y barra de progreso de lectura (verde).
   Depende de: lib/queries/categories.js, components/layout/{inmuebles-menu,mobile-nav}.jsx,
   site-header.module.css */
