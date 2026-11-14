// src/components/property/empty-state.jsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/icons';
import { whatsappUrl } from '@/lib/contacto';
import { getContacto } from '@/lib/queries/settings';
import styles from './empty-state.module.css';

/**
 * Estado vacío de un listado con salida a WhatsApp y a todas las propiedades.
 * @param {{ Icono: import('react').ComponentType<any>, categoria?: string, error?: boolean }} props
 */
export default async function EmptyState({ Icono, categoria, error = false }) {
  const contacto = await getContacto();
  const titulo = error
    ? 'No pudimos cargar las propiedades'
    : `Pronto verá ${categoria ? categoria.toLowerCase() : 'propiedades'} aquí`;
  const texto = error
    ? 'Intente de nuevo en unos minutos o escríbanos y lo ayudamos.'
    : 'Estamos sumando propiedades. Cuéntenos qué busca y le avisamos apenas tengamos una.';
  const mensaje = `Hola, busco ${categoria ? categoria.toLowerCase() : 'una propiedad'} en Chajarí.`;

  return (
    <div className={styles.box}>
      <div className={styles.art} aria-hidden="true">
        <span className={styles.ring} />
        <span className={`${styles.ring} ${styles.ring2}`} />
        <Icono className={styles.icon} size={40} strokeWidth={1.5} />
      </div>
      <h2 className={styles.title}>{titulo}</h2>
      <p className={styles.text}>{texto}</p>
      <div className={styles.actions}>
        <a
          href={whatsappUrl(contacto, mensaje)}
          className={styles.primary}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon size={18} />
          Consultar por WhatsApp
        </a>
        <Link href="/propiedades" className={styles.secondary}>
          Ver todas
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

/* RESUMEN
   Estado vacío o de error de un listado (Server Component): ícono con anillos que laten, título,
   texto y CTAs a WhatsApp (mensaje con la categoría) y a /propiedades. Recibe `Icono`, `categoria`
   y `error`. Depende de: components/ui/icons.jsx, lib/contacto.js, lib/queries/settings.js, empty-state.module.css */
