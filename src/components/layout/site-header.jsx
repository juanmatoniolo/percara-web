// src/components/layout/site-header.jsx
import Link from 'next/link';
import { CATEGORIAS } from '@/lib/queries/categories';
import InmueblesMenu from './inmuebles-menu';
import MobileNav from './mobile-nav';
import styles from './site-header.module.css';

/* Páginas propias e indexables (antes eran anclas de la home) */
const ANCLAS = [
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/contacto', label: 'Contacto' },
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
          {/* <img> simple con prioridad baja a propósito: React/next precargaban el logo en cada página
              (competía con la imagen principal) y next/image armaba 16 tamaños de un archivo de 30 KB. Lo genera
              scripts/generate-logo-header.mjs (fondo transparente, 567x128). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-percara.webp"
            alt="Percara Negocios Inmobiliarios, ir al inicio"
            width={567}
            height={128}
            decoding="async"
            fetchPriority="low"
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
   Header fijo (Server Component): logo (public/logo-percara.webp), desplegable "Inmuebles" con categorías, links a
   /sobre-nosotros y /contacto, menú móvil y barra de progreso de lectura (verde).
   Depende de: lib/queries/categories.js, components/layout/{inmuebles-menu,mobile-nav}.jsx,
   site-header.module.css */
