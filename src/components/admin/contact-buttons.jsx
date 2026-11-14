// src/components/admin/contact-buttons.jsx
import { Phone } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/icons';
import { linkLlamar, linkWhatsApp } from '@/lib/telefono';
import styles from './contact-buttons.module.css';

/**
 * WhatsApp (con mensaje prellenado) y Llamar a un contacto, en un clic. Si el teléfono no se puede
 * pasar al formato de WhatsApp, queda solo "Llamar"; sin teléfono, un aviso.
 * @param {{ telefono: string | null, nombre: string, mensaje?: string, compacto?: boolean }} props
 */
export default function ContactButtons({ telefono, nombre, mensaje, compacto = false }) {
  const wa = linkWhatsApp(telefono, mensaje);
  const tel = linkLlamar(telefono);
  if (!wa && !tel) return <p className={styles.sin}>Sin teléfono cargado</p>;

  return (
    <div className={styles.wrap} data-compacto={compacto || undefined}>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsapp}
          aria-label={`Escribir por WhatsApp a ${nombre}`}
        >
          <WhatsAppIcon size={18} />
          <span className={styles.texto}>WhatsApp</span>
        </a>
      )}
      {tel && (
        <a href={tel} className={styles.call} aria-label={`Llamar a ${nombre}`}>
          <Phone size={18} aria-hidden="true" />
          <span className={styles.texto}>Llamar</span>
        </a>
      )}
    </div>
  );
}

/* RESUMEN
   Botones de contacto del panel (Server Component): WhatsApp verde con texto blanco (mensaje prellenado)
   y Llamar azul. Recibe `telefono`, `nombre` (para la etiqueta accesible), `mensaje` y `compacto`
   (solo íconos en móvil). Depende de: lib/telefono.js, components/ui/icons.jsx, module.css */
