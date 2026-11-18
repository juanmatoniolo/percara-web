// src/app/not-found.jsx
import Link from 'next/link';
import { House } from 'lucide-react';
import styles from './not-found.module.css';

export const metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: true },
};

/* Sin header ni footer: en rutas ISR Next 15 arma el 404 en el navegador y sus estilos no siempre
   llegan, lo que mezclaba tamaños. Página mínima y autosuficiente. */
export default function NotFound() {
  return (
    <main id="contenido" className={styles.page}>
      <h1 className={styles.title}>Error 404</h1>
      <Link href="/" className={styles.home}>
        <House size={18} aria-hidden="true" />
        Volver al inicio
      </Link>
    </main>
  );
}

/* RESUMEN
   Página 404 (Server Component, noindex, código HTTP 404): solo "Error 404" y un botón para volver al
   inicio, centrados a pantalla completa. Depende de: not-found.module.css */
