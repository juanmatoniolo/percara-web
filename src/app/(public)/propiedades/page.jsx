// src/app/(public)/propiedades/page.jsx
import { redirect } from 'next/navigation';
import { LayoutList } from 'lucide-react';
import ListingView from '@/components/property/listing-view';
import { getCategoria } from '@/lib/categories-meta';
import { getConteoPorCategoria, getPropiedades } from '@/lib/queries/properties';
import { jsonLdBreadcrumb, pageMetadata, serializeJsonLd } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Propiedades en venta en Chajarí',
  description:
    'Casas, campos, terrenos, quintas, departamentos y locales en venta en Chajarí y alrededores. Asesoramiento personalizado en Inmobiliaria Percara.',
  path: '/propiedades',
});

export default async function PropiedadesPage({ searchParams }) {
  /* El buscador del hero envía ?categoria=slug: se redirige a la URL limpia e indexable */
  const { categoria } = await searchParams;
  if (typeof categoria === 'string' && getCategoria(categoria))
    redirect(`/categorias/${categoria}`);

  const [resultado, conteo] = await Promise.all([getPropiedades(), getConteoPorCategoria()]);
  const migas = [
    { nombre: 'Inicio', path: '/' },
    { nombre: 'Propiedades', path: '/propiedades' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdBreadcrumb(migas)) }}
      />
      <ListingView
        titulo="Propiedades en venta"
        bajada="Todas las propiedades disponibles en Chajarí y alrededores."
        Icono={LayoutList}
        migas={migas}
        resultado={resultado}
        conteo={conteo}
      />
    </>
  );
}

/* RESUMEN
   Listado general /propiedades (Server Component). Redirige ?categoria=slug (buscador del hero) a
   /categorias/slug; si no, muestra todas las publicadas con pestañas, metadata y BreadcrumbList.
   Depende de: listing-view.jsx, lib/{categories-meta,seo}.js, lib/queries/properties.js */
