// src/app/(public)/propiedades/(listado)/loading.jsx
import ListingSkeleton from '@/components/property/listing-skeleton';

/* Solo para el listado (grupo "(listado)"): el detalle /propiedades/[slug] no lleva loading para que
   una propiedad inexistente siga respondiendo 404 real y no 200 por streaming (soft 404). */
export default function Loading() {
  return <ListingSkeleton />;
}

/* RESUMEN
   Pantalla de carga de /propiedades mientras llegan los datos (conexión lenta o navegación).
   Depende de: components/property/listing-skeleton.jsx */
