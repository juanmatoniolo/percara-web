// src/app/(public)/categorias/[categoria]/page.jsx
import { notFound } from 'next/navigation';
import ListingView from '@/components/property/listing-view';
import { CATEGORIAS } from '@/lib/queries/categories';
import { getCategoria } from '@/lib/categories-meta';
import { getConteoPorCategoria, getPropiedades } from '@/lib/queries/properties';
import { jsonLdBreadcrumb, pageMetadata, serializeJsonLd } from '@/lib/seo';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIAS.map(({ slug }) => ({ categoria: slug }));
}

export async function generateMetadata({ params }) {
  const { categoria } = await params;
  const cat = getCategoria(categoria);
  if (!cat) return {};
  return pageMetadata({
    title: `${cat.nombre} en venta en Chajarí`,
    description: `${cat.bajada} Asesoramiento personalizado en Inmobiliaria Percara.`,
    path: `/categorias/${cat.slug}`,
  });
}

export default async function CategoriaPage({ params }) {
  const { categoria } = await params;
  const cat = getCategoria(categoria);
  if (!cat) notFound();

  const [resultado, conteo] = await Promise.all([
    getPropiedades({ categoria: cat.slug }),
    getConteoPorCategoria(),
  ]);

  const migas = [
    { nombre: 'Inicio', path: '/' },
    { nombre: 'Propiedades', path: '/propiedades' },
    { nombre: cat.nombre, path: `/categorias/${cat.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdBreadcrumb(migas)) }}
      />
      <ListingView
        titulo={`${cat.nombre} en venta`}
        bajada={cat.bajada}
        Icono={cat.Icono}
        slug={cat.slug}
        nombreCategoria={cat.nombre}
        migas={migas}
        resultado={resultado}
        conteo={conteo}
      />
    </>
  );
}

/* RESUMEN
   Página de categoría (ISR 1 h, 9 rutas estáticas, 404 para slugs desconocidos). generateMetadata con
   title, description y canonical; JSON-LD BreadcrumbList. Lee propiedades publicadas de la categoría
   y el conteo para las pestañas. Depende de: listing-view.jsx, lib/{categories-meta,seo}.js, queries */
