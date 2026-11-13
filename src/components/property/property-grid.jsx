// src/components/property/property-grid.jsx
import PropertyCard from './property-card';
import styles from './property-grid.module.css';

/**
 * Grilla responsive de cards con aparición escalonada al scroll.
 * @param {{ propiedades: import('@/types').Propiedad[], prioridadPrimera?: boolean,
 *   nivel?: 'h2' | 'h3' }} props
 */
export default function PropertyGrid({ propiedades, prioridadPrimera = false, nivel = 'h3' }) {
  return (
    <ul className={styles.grid}>
      {propiedades.map((p, i) => (
        <li key={p.id} className={`${styles.item} reveal`} style={{ '--i': i % 3 }}>
          <PropertyCard propiedad={p} prioridad={prioridadPrimera && i === 0} nivel={nivel} />
        </li>
      ))}
    </ul>
  );
}

/* RESUMEN
   Grilla de propiedades (Server Component): 1 columna en móvil, 2 desde 768px y 3 desde 1024px.
   Recibe `propiedades`, `prioridadPrimera` (priority en la primera imagen si es LCP) y `nivel`.
   Depende de: property-card.jsx, property-grid.module.css, styles/animations.css (.reveal) */
