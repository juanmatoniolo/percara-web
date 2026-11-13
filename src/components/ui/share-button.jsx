// src/components/ui/share-button.jsx
'use client';

import { useId, useRef, useState } from 'react';
import { Check, Copy, Share2, X } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/icons';
import styles from './share-button.module.css';

/**
 * Botón "Compartir" pensado para cualquier usuario: en el celular abre el menú nativo (Web Share API);
 * en la computadora, un panel grande con "Enviar por WhatsApp" y "Copiar enlace".
 * @param {{ path: string, titulo: string, texto: string, className?: string }} props
 */
export default function ShareButton({ path, titulo, texto, className = '' }) {
  const panelId = useId();
  const panelRef = useRef(null);
  const [url, setUrl] = useState('');
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const absoluta = new URL(path, window.location.origin).toString();
    setUrl(absoluta);
    setCopiado(false);
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url: absoluta });
        return;
      } catch (e) {
        if (e?.name === 'AbortError') return; // el usuario cerró el menú nativo
      }
    }
    if (panelRef.current?.showPopover) panelRef.current.showPopover();
    else
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${texto} ${absoluta}`)}`,
        '_blank',
        'noopener',
      );
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <>
      <button type="button" className={`${styles.trigger} ${className}`} onClick={compartir}>
        <Share2 size={20} aria-hidden="true" />
        Compartir
      </button>

      <div
        ref={panelRef}
        id={panelId}
        popover="auto"
        className={styles.panel}
        role="dialog"
        aria-label={`Compartir ${titulo}`}
      >
        <p className={styles.title}>Compartir esta propiedad</p>
        <p className={styles.name}>{titulo}</p>
        <a
          className={styles.whatsapp}
          href={`https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon size={22} />
          Enviar por WhatsApp
        </a>
        <button type="button" className={styles.copy} onClick={copiar} aria-live="polite">
          {copiado ? <Check size={22} aria-hidden="true" /> : <Copy size={22} aria-hidden="true" />}
          {copiado ? '¡Enlace copiado!' : 'Copiar enlace'}
        </button>
        <button
          type="button"
          className={styles.close}
          popoverTarget={panelId}
          popoverTargetAction="hide"
        >
          <X size={20} aria-hidden="true" />
          Cerrar
        </button>
      </div>
    </>
  );
}

/* RESUMEN
   Botón Compartir (Client Component: necesita navigator.share y el portapapeles). Recibe `path`, `titulo`,
   `texto` y `className`. Con Web Share abre el menú nativo; si no, un popover con WhatsApp (texto + link) y
   copiar enlace. Depende de: components/ui/icons.jsx, share-button.module.css, lucide-react */
