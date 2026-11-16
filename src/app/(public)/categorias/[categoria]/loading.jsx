// src/app/(public)/categorias/[categoria]/loading.jsx
import ListingSkeleton from '@/components/property/listing-skeleton';

/* Seguro para el 404: con dynamicParams = false una categoría inexistente responde 404 antes de renderizar. */
export default function Loading() {
  return <ListingSkeleton />;
}

/* RESUMEN
   Pantalla de carga de /categorias/[categoria] mientras llegan las propiedades.
   Depende de: components/property/listing-skeleton.jsx */
