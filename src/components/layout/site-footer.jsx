// src/components/layout/site-footer.jsx
import Link from 'next/link';
import { whatsappUrl } from '@/lib/contacto';
import { getContacto } from '@/lib/queries/settings';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/ui/icons';
import styles from './site-footer.module.css';

const EXTERNO = { target: '_blank', rel: 'noopener noreferrer' };

/** @param {import('@/lib/contacto').Contacto} c */
const redes = (c) =>
  [
    { label: 'Instagram', href: c.instagram, Icono: InstagramIcon },
    { label: 'WhatsApp', href: whatsappUrl(c), Icono: WhatsAppIcon },
    { label: 'Facebook', href: c.facebook, Icono: FacebookIcon },
  ].filter((r) => r.href);

/* TODO: crear estas páginas con el texto legal que provea la inmobiliaria (hoy dan 404). */
const LEGALES = [
  { label: 'Política de privacidad', href: '/politica-de-privacidad' },
  { label: 'Términos de servicio', href: '/terminos-de-servicio' },
];

export default async function SiteFooter() {
  const contacto = await getContacto();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>© {year} Percara Negocios Inmobiliarios. Todos los derechos reservados.</p>
        <p className={styles.soft}>
          Esta página fue creada por Revolucion Red y el desarrollador Juanma Toniolo.
        </p>

        <ul className={styles.row}>
          {LEGALES.map(({ label, href }) => (
            <li key={href}>
              <Link href={href} className={styles.link}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <p className={styles.soft}>Síganos en nuestras redes sociales:</p>
        <ul className={styles.row}>
          {redes(contacto).map(({ label, href, Icono }) => (
            <li key={label}>
              <a href={href} className={styles.link} {...EXTERNO}>
                <Icono size={16} />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

/* RESUMEN
   Footer verde centrado y minimalista (Server Component), como el sitio actual: copyright, crédito
   de desarrollo, enlaces legales (TODO: páginas pendientes) y redes sociales.
   Depende de: lib/contacto.js, lib/queries/settings.js, components/ui/icons.jsx, site-footer.module.css */
