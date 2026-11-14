// src/components/layout/page-header.jsx
import Breadcrumbs from '@/components/ui/breadcrumbs';
import styles from './page-header.module.css';

/**
 * Encabezado de páginas institucionales: migas, H1 y bajada.
 * @param {{ migas: { nombre: string, path: string }[], titulo: string, bajada?: string }} props
 */
export default function PageHeader({ migas, titulo, bajada }) {
  return (
    <header className={styles.head}>
      <Breadcrumbs items={migas} />
      <h1 className={styles.title}>{titulo}</h1>
      {bajada && <p className={styles.lead}>{bajada}</p>}
    </header>
  );
}

/* RESUMEN
   Encabezado de página (Server Component): migas de pan visibles, H1 azul y bajada gris, centrado en el
   contenedor. Recibe `migas`, `titulo`, `bajada`. Depende de: components/ui/breadcrumbs.jsx, module.css */
