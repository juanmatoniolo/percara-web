// src/app/(public)/page.jsx
import Hero from '@/components/home/hero';
import StatsBand from '@/components/home/stats-band';
import CategoryGrid from '@/components/home/category-grid';
import FeaturedProperties from '@/components/home/featured-properties';
import CtaBand from '@/components/home/cta-band';
import WhyUs from '@/components/home/why-us';
import ContactSection from '@/components/home/contact-section';
import { pageMetadata, jsonLdInmobiliaria, serializeJsonLd } from '@/lib/seo';
import { getContacto } from '@/lib/queries/settings';
import styles from './page.module.css';

export const metadata = pageMetadata();
export const revalidate = 3600;

export default async function HomePage() {
  const contacto = await getContacto();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdInmobiliaria(contacto)) }}
      />
      <Hero />
      <StatsBand />
      <CategoryGrid />
      <FeaturedProperties />
      {/* Dos columnas como en el sitio actual: anclas #sobre-nosotros y #contacto del header */}
      <div className={styles.duo}>
        <div className={styles.duoInner}>
          <WhyUs />
          <ContactSection />
        </div>
      </div>
      <CtaBand />
    </>
  );
}

/* RESUMEN
   Página de inicio (Server Component, ISR 1 h): hero con foto y buscador, banda de datos, categorías
   con cantidades, destacadas, bloque "¿Por qué elegirnos?" + "¿Cómo contactarnos?" y CTA de venta.
   Publica metadata con canonical y JSON-LD RealEstateAgent con los datos del panel. Depende de:
   components/home/*, lib/seo.js, lib/queries/settings.js,
   page.module.css */
