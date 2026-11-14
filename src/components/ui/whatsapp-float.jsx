// src/components/ui/whatsapp-float.jsx
import { WhatsAppIcon } from '@/components/ui/icons';
import { whatsappUrl } from '@/lib/contacto';
import { getContacto } from '@/lib/queries/settings';
import styles from './whatsapp-float.module.css';

const MENSAJE = 'Hola, quisiera consultar por una propiedad.';

export default async function WhatsAppFloat() {
  const contacto = await getContacto();

  return (
    <a
      href={whatsappUrl(contacto, MENSAJE)}
      className={styles.float}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
    >
      <WhatsAppIcon size={26} />
      <span className={styles.label}>Consultar por WhatsApp</span>
    </a>
  );
}

/* RESUMEN
   Botón flotante de WhatsApp (Server Component, sin JS) con mensaje prellenado. Circular en móvil;
   con texto desde 768px. Se reemplazará por la versión con el nombre y el enlace de cada propiedad.
   Depende de: components/ui/icons.jsx, lib/contacto.js, lib/queries/settings.js, whatsapp-float.module.css */
