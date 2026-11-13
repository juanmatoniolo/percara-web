// src/components/home/contact-section.jsx
import { Mail, MapPin, Phone } from 'lucide-react';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/ui/icons';
import SectionTitle from '@/components/ui/section-title';
import { CONTACT, whatsappUrl } from '@/lib/site-config';
import styles from './contact-section.module.css';

const MENSAJE = 'Hola, quisiera consultar por una propiedad.';
const EXTERNO = { target: '_blank', rel: 'noopener noreferrer' };

const CANALES = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    href: whatsappUrl(MENSAJE),
    Icono: WhatsAppIcon,
    externo: true,
    destacado: true,
  },
  { key: 'telefono', label: 'Llamar', href: `tel:${CONTACT.telefonoE164}`, Icono: Phone },
  { key: 'email', label: 'Email', href: `mailto:${CONTACT.email}`, Icono: Mail },
  { key: 'ubicacion', label: 'Ubicación', href: CONTACT.mapsUrl, Icono: MapPin, externo: true },
  {
    key: 'instagram',
    label: 'Instagram',
    href: CONTACT.instagram,
    Icono: InstagramIcon,
    externo: true,
  },
  {
    key: 'facebook',
    label: 'Facebook',
    href: CONTACT.facebook,
    Icono: FacebookIcon,
    externo: true,
  },
];

export default function ContactSection() {
  return (
    <section id="contacto" className={styles.block} aria-labelledby="contacto-title">
      <SectionTitle id="contacto-title">¿Cómo contactarnos?</SectionTitle>

      <p className={`${styles.lead} reveal`}>
        Estamos en Chajarí. Escríbanos o llámenos y lo asesoramos en cada paso.
      </p>

      <ul className={styles.grid}>
        {CANALES.map(({ key, label, href, Icono, externo, destacado }, i) => (
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
          <dd>{CONTACT.telefono}</dd>
        </div>
        <div>
          <dt>Oficina</dt>
          <dd>{CONTACT.direccionCorta}</dd>
        </div>
      </dl>
    </section>
  );
}

/* RESUMEN
   Bloque "¿Cómo contactarnos?" (Server Component, ancla #contacto): botones tipo píldora (WhatsApp
   destacado, llamar, email, ubicación, redes) y datos visibles de teléfono y oficina.
   Depende de: components/ui/{section-title,icons}.jsx, lib/site-config.js, contact-section.module.css */
