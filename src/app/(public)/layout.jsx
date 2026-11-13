// src/app/(public)/layout.jsx
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import WhatsAppFloat from '@/components/ui/whatsapp-float';

export default function PublicLayout({ children }) {
  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}

/* RESUMEN
   Layout del sitio público (Server Component): enlace de salto, header, contenido, footer y botón
   flotante de WhatsApp. Recibe `children`.
   Depende de: components/layout/site-header.jsx, site-footer.jsx, components/ui/whatsapp-float.jsx */
