// src/app/(public)/sobre-nosotros/page.jsx
import PageHeader from '@/components/layout/page-header';
import StatsBand from '@/components/home/stats-band';
import WhyUs from '@/components/home/why-us';
import CtaBand from '@/components/home/cta-band';
import { jsonLdBreadcrumb, pageMetadata, serializeJsonLd } from '@/lib/seo';
import styles from '../page.module.css';

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'Sobre nosotros, inmobiliaria en Chajarí',
  description:
    'Percara Negocios Inmobiliarios: más de 10 años en la compra y venta de inmuebles en Chajarí y alrededores, con atención personalizada y transparencia en cada operación.',
  path: '/sobre-nosotros',
});

const MIGAS = [
  { nombre: 'Inicio', path: '/' },
  { nombre: 'Sobre nosotros', path: '/sobre-nosotros' },
];

export default function SobreNosotrosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdBreadcrumb(MIGAS)) }}
      />
      <PageHeader
        migas={MIGAS}
        titulo="Sobre Percara Negocios Inmobiliarios"
        bajada="Más de 10 años acompañando la compra y venta de inmuebles en Chajarí y alrededores, con atención personalizada."
      />
      <StatsBand />
      <div className={styles.duo}>
        <div className={styles.duoInner}>
          <WhyUs />
        </div>
      </div>
      <CtaBand />
    </>
  );
}

/* RESUMEN
   Página /sobre-nosotros (Server Component, ISR 1 h): metadata propia, BreadcrumbList, H1 con datos
   confirmados por el cliente, banda de datos, "¿Por qué elegirnos?" y CTA de venta. Depende de:
   components/layout/page-header.jsx, components/home/{stats-band,why-us,cta-band}.jsx, lib/seo.js */
