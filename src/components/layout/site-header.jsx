// src/components/layout/site-header.jsx
import Image from 'next/image';
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
        <Link href="/" className={styles.brand}>
          {/* Logo generado con scripts/generate-logo-header.mjs (fondo transparente, 567x128) */}
          <Image
            src="/logo-percara.webp"
            alt="Percara Negocios Inmobiliarios, ir al inicio"
            width={567}
            height={128}
            sizes="14rem"
            loading="eager"
            className={styles.logo}
          />
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
   Header fijo (Server Component): logo (public/logo-percara.webp), desplegable "Inmuebles" con categorías, anclas suaves a
   #sobre-nosotros y #contacto de la home, menú móvil y barra de progreso de lectura (verde).
   Depende de: next/image, lib/queries/categories.js, components/layout/{inmuebles-menu,mobile-nav}.jsx,
   site-header.module.css */
