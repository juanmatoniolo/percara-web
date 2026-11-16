// src/components/property/localidad-filter.jsx
import Link from 'next/link';
import { MapPin, X } from 'lucide-react';
import styles from './localidad-filter.module.css';

/**
 * Filtro por localidad (Server Component, sin JS): formulario GET con las localidades que tienen
 * propiedades publicadas. La URL resultante (?localidad=) es compartible.
 * @param {{ base: string, localidades: { nombre: string, n: number }[], actual?: string }} props
 */
export default function LocalidadFilter({ base, localidades, actual }) {
  if (localidades.length < 2 && !actual) return null;

  return (
    <form method="get" action={base} className={styles.form} role="search">
      <label htmlFor="filtro-localidad" className={styles.label}>
        <MapPin size={18} strokeWidth={1.75} aria-hidden="true" />
        Localidad
      </label>
      <select
        id="filtro-localidad"
        name="localidad"
        defaultValue={actual ?? ''}
        className={styles.select}
      >
        <option value="">Todas las localidades</option>
        {localidades.map(({ nombre, n }) => (
          <option key={nombre} value={nombre}>
            {nombre} ({n})
          </option>
        ))}
      </select>
      <button type="submit" className={styles.submit}>
        Filtrar
      </button>
      {actual && (
        <Link href={base} className={styles.clear}>
          <X size={16} aria-hidden="true" />
          Quitar filtro
        </Link>
      )}
    </form>
  );
}

/* RESUMEN
   Filtro de localidad del listado (Server Component, funciona sin JS): select con cantidad por localidad,
   botón Filtrar y "Quitar filtro". Recibe base (ruta del listado), localidades y la actual.
   Depende de: localidad-filter.module.css */
