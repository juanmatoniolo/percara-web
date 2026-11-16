// src/app/(public)/categorias/[categoria]/layout.jsx
import { notFound } from 'next/navigation';
import { getCategoria } from '@/lib/categories-meta';

/**
 * Valida la categoría ANTES del loading.jsx: el 404 se decide en el layout (fuera del Suspense de la
 * pantalla de carga), así una categoría inexistente responde 404 real y no 200 por streaming.
 */
export default async function CategoriaLayout({ children, params }) {
  const { categoria } = await params;
  if (!getCategoria(categoria)) notFound();
  return children;
}

/* RESUMEN
   Layout de /categorias/[categoria]: corta con 404 si el slug no es una de las 9 categorías, antes de que
   se muestre el esqueleto de carga. Recibe children y params. Depende de: lib/categories-meta.js */
