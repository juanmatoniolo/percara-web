// src/app/(public)/contacto/page.jsx
import PageHeader from '@/components/layout/page-header';
import ContactSection from '@/components/home/contact-section';
import { getContacto } from '@/lib/queries/settings';
import { jsonLdBreadcrumb, jsonLdInmobiliaria, pageMetadata, serializeJsonLd } from '@/lib/seo';
import styles from './page.module.css';

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'Contacto, inmobiliaria en Chajarí',
  description:
    'Contacte a Percara Negocios Inmobiliarios en Chajarí, Entre Ríos: WhatsApp, teléfono, email y dirección de la oficina. Lo asesoramos para comprar o vender su propiedad.',
  path: '/contacto',
});

const MIGAS = [
  { nombre: 'Inicio', path: '/' },
  { nombre: 'Contacto', path: '/contacto' },
];

export default async function ContactoPage() {
  const contacto = await getContacto();
  const mapa = `https://www.google.com/maps?q=${encodeURIComponent(
    [contacto.direccion, contacto.localidad, contacto.provincia].join(', '),
  )}&output=embed`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([jsonLdInmobiliaria(contacto), jsonLdBreadcrumb(MIGAS)]),
        }}
      />
      <PageHeader
        migas={MIGAS}
        titulo="Contacto"
        bajada={`Estamos en ${contacto.direccionCorta}. Escríbanos por WhatsApp o llámenos.`}
      />
      <div className={styles.wrap}>
        <ContactSection />
        <div className={styles.map}>
          {/* Carga diferida: el mapa (pesado, de terceros) baja recién al acercarse a la pantalla */}
          <iframe
            src={mapa}
            title={`Mapa: ${contacto.direccionCorta}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className={styles.frame}
          />
        </div>
      </div>
    </>
  );
}

/* RESUMEN
   Página /contacto (Server Component, ISR 1 h): metadata propia, JSON-LD RealEstateAgent + BreadcrumbList,
   H1, bloque de contacto con los datos del panel y mapa de Google con carga diferida.
   Depende de: components/layout/page-header.jsx, components/home/contact-section.jsx,
   lib/queries/settings.js, lib/seo.js, page.module.css */
