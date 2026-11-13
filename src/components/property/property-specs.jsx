// src/components/property/property-specs.jsx
import { Bath, BedDouble, Car, DoorOpen, Home, MapPin, Maximize2, Tag } from 'lucide-react';
import { formatSuperficie } from '@/lib/format';
import styles from './property-specs.module.css';

/**
 * Ficha técnica como lista agrupada (etiqueta a la izquierda, valor a la derecha). Omite datos vacíos.
 * @param {{ propiedad: import('@/types').Propiedad }} props
 */
export default function PropertySpecs({ propiedad: p }) {
  const filas = [
    { Icono: Tag, etiqueta: 'Operación', valor: p.operacion === 'venta' ? 'Venta' : 'Alquiler' },
    { Icono: Home, etiqueta: 'Tipo', valor: p.categoria.nombre },
    {
      Icono: MapPin,
      etiqueta: 'Ubicación',
      valor: [p.direccion, p.localidad].filter(Boolean).join(', '),
    },
    { Icono: Maximize2, etiqueta: 'Superficie total', valor: formatSuperficie(p.superficie_total) },
    {
      Icono: Maximize2,
      etiqueta: 'Superficie cubierta',
      valor: formatSuperficie(p.superficie_cubierta),
    },
    { Icono: DoorOpen, etiqueta: 'Ambientes', valor: p.ambientes },
    { Icono: BedDouble, etiqueta: 'Dormitorios', valor: p.dormitorios },
    { Icono: Bath, etiqueta: 'Baños', valor: p.banos },
    { Icono: Car, etiqueta: 'Cochera', valor: p.cochera ? 'Sí' : null },
  ].filter((f) => f.valor !== null && f.valor !== undefined && f.valor !== '' && f.valor !== 0);

  return (
    <dl className={styles.list}>
      {filas.map(({ Icono, etiqueta, valor }, i) => (
        <div key={etiqueta} className={`${styles.row} reveal`} style={{ '--i': i % 4 }}>
          <dt className={styles.label}>
            <Icono size={18} strokeWidth={1.75} aria-hidden="true" />
            {etiqueta}
          </dt>
          <dd className={styles.value}>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

/* RESUMEN
   Ficha técnica del detalle (Server Component): <dl> agrupada con ícono, etiqueta y valor, sin filas
   vacías; superficie en m² o ha. Recibe `propiedad`. Depende de: lib/format.js, property-specs.module.css */
