// src/app/not-found.jsx
import Link from 'next/link';
import { ArrowRight, House } from 'lucide-react';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import { CATEGORIAS } from '@/lib/queries/categories';
import styles from './not-found.module.css';

export const metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: true },
};

/** 404 real (código HTTP 404): explica, ofrece salidas útiles y nunca se indexa. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className={styles.page}>
        <p className={styles.code} aria-hidden="true">
          404
        </p>
        <h1 className={styles.title}>No encontramos esta página</h1>
        <p className={styles.lead}>
          Puede que la propiedad ya se haya vendido o que el enlace tenga un error. Estas son
          algunas opciones para seguir buscando:
        </p>
        <div className={styles.actions}>
          <Link href="/propiedades" className={styles.primary}>
            Ver todas las propiedades
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/" className={styles.secondary}>
            <House size={18} aria-hidden="true" />
            Ir al inicio
          </Link>
        </div>
        <nav aria-label="Categorías" className={styles.cats}>
          {CATEGORIAS.map((c) => (
            <Link key={c.slug} href={`/categorias/${c.slug}`} className={styles.cat}>
              {c.nombre}
            </Link>
          ))}
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}

/* RESUMEN
   Página 404 (Server Component, noindex): header y footer del sitio, mensaje claro, accesos a todas las
   propiedades, al inicio y a las 9 categorías. Depende de: components/layout/{site-header,site-footer},
   lib/queries/categories.js, not-found.module.css */
