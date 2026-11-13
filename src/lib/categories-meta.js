// src/lib/categories-meta.js
import {
  Building2,
  Home,
  LandPlot,
  LayoutGrid,
  Mountain,
  Sprout,
  Store,
  Trees,
  Warehouse,
} from 'lucide-react';
import { CATEGORIAS } from '@/lib/queries/categories';

/** Ícono y bajada de cada categoría (bajada usada en el encabezado y en la meta description). */
const META = {
  campos: {
    Icono: Mountain,
    bajada: 'Campos agrícolas y ganaderos en venta en Chajarí y alrededores.',
  },
  casas: { Icono: Home, bajada: 'Casas en venta en Chajarí y la zona, para vivir o invertir.' },
  departamentos: {
    Icono: Building2,
    bajada: 'Departamentos en venta en Chajarí, prácticos y bien ubicados.',
  },
  forestaciones: { Icono: Trees, bajada: 'Forestaciones en venta en Chajarí y la región.' },
  galpones: {
    Icono: Warehouse,
    bajada: 'Galpones en venta en Chajarí para uso comercial, industrial o rural.',
  },
  'locales-y-oficinas': {
    Icono: Store,
    bajada: 'Locales comerciales y oficinas en venta en Chajarí.',
  },
  quintas: {
    Icono: Sprout,
    bajada: 'Quintas en venta en Chajarí y alrededores, con espacio verde.',
  },
  terrenos: {
    Icono: LandPlot,
    bajada: 'Terrenos y lotes en venta en Chajarí para construir o invertir.',
  },
  'otras-propiedades': {
    Icono: LayoutGrid,
    bajada: 'Otras propiedades en venta en Chajarí y la zona.',
  },
};

const FALLBACK = { Icono: Home, bajada: 'Propiedades en venta en Chajarí y alrededores.' };

/**
 * Categoría enriquecida con ícono y bajada, o null si el slug no existe.
 * @param {string} slug
 */
export function getCategoria(slug) {
  const cat = CATEGORIAS.find((c) => c.slug === slug);
  return cat ? { ...cat, ...(META[slug] ?? FALLBACK) } : null;
}

/** @param {string} slug */
export function iconoCategoria(slug) {
  return (META[slug] ?? FALLBACK).Icono;
}

/* RESUMEN
   Metadatos visuales y de SEO por categoría: ícono de lucide y bajada corta. Exporta getCategoria(slug)
   (o null si no existe) e iconoCategoria(slug). Fuente única para home, pestañas, cards y metadata.
   Depende de: lib/queries/categories.js, lucide-react */
