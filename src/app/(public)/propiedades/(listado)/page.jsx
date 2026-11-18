// src/app/(public)/propiedades/(listado)/page.jsx
import { redirect } from 'next/navigation';
import { LayoutList } from 'lucide-react';
import ListingView from '@/components/property/listing-view';
import { getCategoria } from '@/lib/categories-meta';
import { getConteoPorCategoria, getLugares, getPropiedades } from '@/lib/queries/properties';
import { POR_PAGINA, leerFiltros } from '@/lib/listado';
import { jsonLdBreadcrumb, pageMetadata, serializeJsonLd } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Propiedades en venta en Chajarí',
  description:
    'Casas, campos, terrenos, quintas, departamentos y locales en venta en Chajarí y alrededores. Asesoramiento personalizado en Inmobiliaria Percara.',
  path: '/propiedades',
});

export default async function PropiedadesPage({ searchParams }) {
  /* El buscador del hero envía ?categoria=slug: se redirige a la URL limpia e indexable */
  const sp = await searchParams;
  if (typeof sp.categoria === 'string' && getCategoria(sp.categoria))
    redirect(`/categorias/${sp.categoria}`);

  const arbol = await getLugares();
  const filtros = leerFiltros(sp, arbol);
  const [resultado, conteo] = await Promise.all([
    getPropiedades({ ...filtros, limite: POR_PAGINA }),
    getConteoPorCategoria(),
  ]);
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
        base="/propiedades"
        arbol={arbol}
        filtros={filtros}
      />
    </>
  );
}

/* RESUMEN
   Listado general /propiedades (Server Component). Redirige ?categoria=slug (buscador del hero) a
   /categorias/slug; si no, lista las publicadas (24 por página, filtros ?provincia= ?localidad= ?barrio= ?conprecio=) con pestañas,
   metadata y BreadcrumbList.
   Depende de: listing-view.jsx, lib/{categories-meta,seo,listado}.js, lib/queries/properties.js */
