// src/components/ui/whatsapp-float-cerrable.jsx
'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/icons';
import styles from './whatsapp-float.module.css';

const CLAVE = 'percara-wa-cerrado';

/**
 * Botón flotante de WhatsApp con una "x" para ocultarlo. Queda oculto hasta cerrar la pestaña del
 * navegador (sessionStorage): en la próxima visita vuelve a aparecer.
 * @param {{ href: string }} props
 */
export default function WhatsAppFloatCerrable({ href }) {
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLAVE) === '1') setCerrado(true);
    } catch {
      /* Sin almacenamiento (modo privado estricto): se muestra igual */
    }
  }, []);

  function cerrar() {
    setCerrado(true);
    try {
      sessionStorage.setItem(CLAVE, '1');
    } catch {
      /* idem */
    }
  }

  if (cerrado) return null;

  return (
    <div className={styles.wrap}>
      <a
        href={href}
        className={styles.float}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Consultar por WhatsApp"
      >
        <WhatsAppIcon size={26} />
        <span className={styles.label}>Consultar por WhatsApp</span>
      </a>
      <button type="button" className={styles.close} onClick={cerrar}>
        <X size={14} aria-hidden="true" />
        <span className="sr-only">Ocultar el botón de WhatsApp</span>
      </button>
    </div>
  );
}

/* RESUMEN
   Botón flotante de WhatsApp (Client Component) con botón "x" para ocultarlo durante la visita
   (sessionStorage). Recibe `href` (link de WhatsApp ya armado en el servidor).
   Depende de: components/ui/icons.jsx, whatsapp-float.module.css */
