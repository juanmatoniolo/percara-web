// src/app/(public)/propiedades/[slug]/page.jsx
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import SectionTitle from '@/components/ui/section-title';
import PropertyGallery from '@/components/property/property-gallery';
import PropertyContact from '@/components/property/property-contact';
import PropertySpecs from '@/components/property/property-specs';
import PropertyGrid from '@/components/property/property-grid';
import { getPropiedad, getPropiedades } from '@/lib/queries/properties';
import { datosClave, precioPublico, recortar } from '@/lib/format';
import { jsonLdBreadcrumb, jsonLdPropiedad, metadataPropiedad, serializeJsonLd } from '@/lib/seo';
import styles from './page.module.css';

export const revalidate = 3600;

/* Sin rutas en build: cada propiedad se genera al primer pedido y queda en caché (ISR) */
export function generateStaticParams() {
  return [];
}

const cargar = cache(async (slug) => {
  const res = await getPropiedad(slug);
  if (!res.ok) throw new Error(res.error);
  return res.data;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await cargar(slug);
  if (!p) return { robots: { index: false } };
  return metadataPropiedad(p, {
    precio: precioPublico(p),
    datos: datosClave(p),
    descripcion: recortar(p.descripcion, 160),
  });
}

export default async function PropiedadPage({ params }) {
  const { slug } = await params;
  const p = await cargar(slug);
  if (!p) notFound();

  const relacionadas = await getPropiedades({ categoria: p.categoria.slug, limite: 4 });
  const otras = relacionadas.ok ? relacionadas.data.filter((r) => r.id !== p.id).slice(0, 3) : [];
  const migas = [
    { nombre: 'Inicio', path: '/' },
    { nombre: p.categoria.nombre, path: `/categorias/${p.categoria.slug}` },
    { nombre: p.titulo, path: `/propiedades/${p.slug}` },
  ];
  const jsonLd = [jsonLdPropiedad(p), jsonLdBreadcrumb(migas)];

  return (
    <article className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className={styles.inner}>
        <Breadcrumbs items={migas} />

        <div className={styles.layout}>
          <PropertyGallery
            imagenes={p.imagenes}
            titulo={p.titulo}
            categoriaSlug={p.categoria.slug}
          />
          <PropertyContact propiedad={p} />

          <div className={styles.details}>
            <section aria-labelledby="ficha-title" className={styles.block}>
              <SectionTitle id="ficha-title">Características</SectionTitle>
              <PropertySpecs propiedad={p} />
            </section>

            {p.descripcion && (
              <section aria-labelledby="desc-title" className={styles.block}>
                <SectionTitle id="desc-title">Descripción</SectionTitle>
                <p className={`${styles.description} reveal`}>{p.descripcion}</p>
              </section>
            )}
          </div>
        </div>
      </div>

      {otras.length > 0 && (
        <section className={styles.related} aria-labelledby="relacionadas-title">
          <div className={styles.inner}>
            <div className={styles.relatedHead}>
              <SectionTitle id="relacionadas-title">
                Más {p.categoria.nombre.toLowerCase()}
              </SectionTitle>
              <Link href={`/categorias/${p.categoria.slug}`} className={styles.more}>
                Ver todas
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <PropertyGrid propiedades={otras} />
          </div>
        </section>
      )}
    </article>
  );
}

/* RESUMEN
   Detalle de propiedad (ISR 1 h, generado al primer pedido). generateMetadata con title, description,
   canonical, OG y Twitter armados con los datos de la propiedad; JSON-LD RealEstateListing + Offer y
   BreadcrumbList. Galería, panel de contacto, ficha, descripción y relacionadas de la misma categoría.
   Depende de: components/{ui,property}/*, lib/queries/properties.js, lib/{format,seo}.js, page.module.css */
