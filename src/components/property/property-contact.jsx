// src/components/property/property-contact.jsx
import { MapPin, MapPinned, Phone } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/icons';
import ShareButton from '@/components/ui/share-button';
import { whatsappUrl } from '@/lib/contacto';
import { getContacto } from '@/lib/queries/settings';
import { precioPublico } from '@/lib/format';
import { SITE_URL } from '@/lib/seo';
import styles from './property-contact.module.css';

/** Link de Google Maps al punto exacto (Maps URLs, sin API key), o null si faltan coordenadas válidas. */
function mapaUrl(lat, lng) {
  const la = Number(lat);
  const ln = Number(lng);
  if (lat == null || lng == null || !Number.isFinite(la) || !Number.isFinite(ln)) return null;
  if (Math.abs(la) > 90 || Math.abs(ln) > 180 || (la === 0 && ln === 0)) return null;
  return `https://www.google.com/maps/search/?api=1&query=${la},${ln}`;
}

/**
 * Panel de precio y contacto del detalle (fijo en escritorio).
 * @param {{ propiedad: import('@/types').Propiedad }} props
 */
export default async function PropertyContact({ propiedad: p }) {
  const contacto = await getContacto();
  const url = new URL(`/propiedades/${p.slug}`, SITE_URL).toString();
  const mensaje = `Hola, me interesa "${p.titulo}". ${url}`;
  const mapa = mapaUrl(p.lat, p.lng);

  return (
    <aside className={styles.panel} aria-labelledby="propiedad-titulo">
      <p className={styles.chips}>
        <span className={styles.chip}>{p.categoria.nombre}</span>
        <span className={`${styles.chip} ${styles.op}`}>
          {p.operacion === 'venta' ? 'Venta' : 'Alquiler'}
        </span>
      </p>

      <h1 id="propiedad-titulo" className={styles.title}>
        {p.titulo}
      </h1>

      {(p.localidad || p.direccion) && (
        <p className={styles.place}>
          <MapPin size={18} aria-hidden="true" />
          {[p.direccion, p.localidad].filter(Boolean).join(', ')}
        </p>
      )}

      <p className={styles.price}>
        <span className="sr-only">Precio: </span>
        {precioPublico(p)}
      </p>

      <div className={styles.actions}>
        <a
          href={whatsappUrl(contacto, mensaje)}
          className={styles.primary}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon size={20} />
          Consultar por WhatsApp
        </a>
        <a href={contacto.telefonoHref} className={styles.secondary}>
          <Phone size={18} aria-hidden="true" />
          Llamar
        </a>
        {mapa && (
          <a href={mapa} className={styles.maps} target="_blank" rel="noopener noreferrer">
            <MapPinned size={18} aria-hidden="true" />
            Ver en Google Maps
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        )}
        <ShareButton
          path={`/propiedades/${p.slug}`}
          titulo={p.titulo}
          texto={`${p.titulo} - ${precioPublico(p)}`}
        />
      </div>
      <p className={styles.note}>Atención personalizada de Percara Negocios Inmobiliarios.</p>
    </aside>
  );
}

/* RESUMEN
   Panel del detalle (Server Component): chips de categoría y operación, H1, ubicación, precio grande y
   CTAs a WhatsApp (mensaje con título y URL de la propiedad), llamada, Ver en Google Maps (solo con lat y
   lng válidas) y Compartir. Recibe `propiedad`.
   Depende de: components/ui/{icons,share-button}.jsx, lib/{contacto,format,seo}.js, lib/queries/settings.js, module.css */
