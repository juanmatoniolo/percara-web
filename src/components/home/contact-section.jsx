// src/components/home/contact-section.jsx
import { Mail, MapPin, Phone } from 'lucide-react';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/ui/icons';
import SectionTitle from '@/components/ui/section-title';
import { whatsappUrl } from '@/lib/contacto';
import { getContacto } from '@/lib/queries/settings';
import styles from './contact-section.module.css';

const MENSAJE = 'Hola, quisiera consultar por una propiedad.';
const EXTERNO = { target: '_blank', rel: 'noopener noreferrer' };

/** @param {import('@/lib/contacto').Contacto} c */
const canales = (c) =>
  [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: whatsappUrl(c, MENSAJE),
      Icono: WhatsAppIcon,
      externo: true,
      destacado: true,
    },
    { key: 'telefono', label: 'Llamar', href: c.telefonoHref, Icono: Phone },
    { key: 'email', label: 'Email', href: `mailto:${c.email}`, Icono: Mail },
    { key: 'ubicacion', label: 'Ubicación', href: c.mapsUrl, Icono: MapPin, externo: true },
    {
      key: 'instagram',
      label: 'Instagram',
      href: c.instagram,
      Icono: InstagramIcon,
      externo: true,
    },
    { key: 'facebook', label: 'Facebook', href: c.facebook, Icono: FacebookIcon, externo: true },
  ].filter((canal) => canal.href);

export default async function ContactSection() {
  const contacto = await getContacto();

  return (
    <section id="contacto" className={styles.block} aria-labelledby="contacto-title">
      <SectionTitle id="contacto-title">¿Cómo contactarnos?</SectionTitle>

      <p className={`${styles.lead} reveal`}>
        Estamos en {contacto.localidad}. Escríbanos o llámenos y lo asesoramos en cada paso.
      </p>

      <ul className={styles.grid}>
        {canales(contacto).map(({ key, label, href, Icono, externo, destacado }, i) => (
          <li key={key} className="reveal" style={{ '--i': i % 3 }}>
            <a
              href={href}
              className={styles.pill}
              data-destacado={destacado || undefined}
              {...(externo ? EXTERNO : {})}
            >
              <Icono size={18} aria-hidden="true" />
              {label}
            </a>
          </li>
        ))}
      </ul>

      <dl className={`${styles.data} reveal`}>
        <div>
          <dt>Teléfono</dt>
          <dd>{contacto.telefono}</dd>
        </div>
        <div>
          <dt>Oficina</dt>
          <dd>{contacto.direccionCorta}</dd>
        </div>
      </dl>
    </section>
  );
}

/* RESUMEN
   Bloque "¿Cómo contactarnos?" (Server Component, ancla #contacto): botones tipo píldora (WhatsApp
   destacado, llamar, email, ubicación, redes; las vacías no se muestran) y teléfono y oficina,
   con los datos editables del panel.
   Depende de: components/ui/{section-title,icons}.jsx, lib/contacto.js, lib/queries/settings.js, contact-section.module.css */
