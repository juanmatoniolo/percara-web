// src/components/ui/whatsapp-float.jsx
import { WhatsAppIcon } from '@/components/ui/icons';
import { whatsappUrl } from '@/lib/site-config';
import styles from './whatsapp-float.module.css';

const MENSAJE = 'Hola, quisiera consultar por una propiedad.';

export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl(MENSAJE)}
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
   Depende de: components/ui/icons.jsx, lib/site-config.js, whatsapp-float.module.css */
