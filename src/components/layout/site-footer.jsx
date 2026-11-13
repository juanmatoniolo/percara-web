// src/components/layout/site-footer.jsx
import Link from 'next/link';
import { CONTACT, whatsappUrl } from '@/lib/site-config';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '@/components/ui/icons';
import styles from './site-footer.module.css';

const EXTERNO = { target: '_blank', rel: 'noopener noreferrer' };

const REDES = [
  { label: 'Instagram', href: CONTACT.instagram, Icono: InstagramIcon },
  { label: 'WhatsApp', href: whatsappUrl(), Icono: WhatsAppIcon },
  { label: 'Facebook', href: CONTACT.facebook, Icono: FacebookIcon },
];

/* TODO: crear estas páginas con el texto legal que provea la inmobiliaria (hoy dan 404). */
const LEGALES = [
  { label: 'Política de privacidad', href: '/politica-de-privacidad' },
  { label: 'Términos de servicio', href: '/terminos-de-servicio' },
];

export default function SiteFooter() {
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
          {REDES.map(({ label, href, Icono }) => (
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
   Depende de: lib/site-config.js, components/ui/icons.jsx, site-footer.module.css */
