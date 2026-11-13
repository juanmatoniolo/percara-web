// src/components/ui/section-title.jsx
import styles from './section-title.module.css';

/**
 * Título de sección con subrayado verde de marca.
 * @param {{ id: string, as?: 'h1' | 'h2' | 'h3', align?: 'start' | 'center',
 *   children: import('react').ReactNode }} props
 */
export default function SectionTitle({ id, as: Tag = 'h2', align = 'start', children }) {
  return (
    <Tag id={id} className={`${styles.title} reveal`} data-align={align}>
      {children}
    </Tag>
  );
}

/* RESUMEN
   Título de sección (Server Component) con línea verde debajo, al estilo del sitio actual.
   Recibe `id` (para aria-labelledby), `as` (h1/h2/h3), `align` y `children`.
   Depende de: section-title.module.css, styles/animations.css (.reveal) */
