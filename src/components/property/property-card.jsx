// src/components/property/property-card.jsx
import Image from 'next/image';
import Link from 'next/link';
import { Bath, BedDouble, Car, MapPin, Maximize2 } from 'lucide-react';
import ShareButton from '@/components/ui/share-button';
import { iconoCategoria } from '@/lib/categories-meta';
import { formatSuperficie, precioPublico } from '@/lib/format';
import styles from './property-card.module.css';

const SIZES = '(min-width: 1280px) 25rem, (min-width: 768px) 50vw, 100vw';

/**
 * Card de propiedad: imagen 4:3, categoría, precio, título, ubicación y ficha fija de 4 datos.
 * @param {{ propiedad: import('@/types').Propiedad, prioridad?: boolean, nivel?: 'h2' | 'h3' }} props
 */
export default function PropertyCard({ propiedad: p, prioridad = false, nivel: Titulo = 'h3' }) {
  const portada = p.imagenes[0];
  const Icono = iconoCategoria(p.categoria.slug);
  /* Ficha fija y homogénea en todas las cards (pedido del cliente): siempre los 4 datos, en el mismo orden */
  const ficha = [
    { Icono: Maximize2, etiqueta: 'Superficie', valor: formatSuperficie(p.superficie_total) },
    { Icono: BedDouble, etiqueta: 'Habitaciones', valor: p.dormitorios || null },
    { Icono: Bath, etiqueta: 'Baños', valor: p.banos || null },
    { Icono: Car, etiqueta: 'Cochera', valor: p.cochera ? 'Sí' : 'No' },
  ];

  return (
    <article className={styles.card}>
      <Link href={`/propiedades/${p.slug}`} className={styles.link}>
        <div className={styles.media}>
          {portada ? (
            <Image
              src={portada.url}
              alt={portada.alt || p.titulo}
              fill
              sizes={SIZES}
              priority={prioridad}
              className={styles.img}
              {...(portada.blur ? { placeholder: 'blur', blurDataURL: portada.blur } : {})}
            />
          ) : (
            <div className={styles.placeholder} aria-hidden="true">
              <Icono size={48} strokeWidth={1.25} />
            </div>
          )}
          <span className={styles.chip}>
            <Icono size={14} aria-hidden="true" />
            {p.categoria.nombre}
          </span>
          {p.destacada && <span className={styles.badge}>Destacada</span>}
        </div>

        <div className={styles.body}>
          <p className={styles.price}>{precioPublico(p)}</p>
          <Titulo className={styles.title}>{p.titulo}</Titulo>
          {p.localidad && (
            <p className={styles.place}>
              <MapPin size={16} aria-hidden="true" />
              {p.localidad}
            </p>
          )}

          <dl className={styles.specs}>
            {ficha.map(({ Icono: Dato, etiqueta, valor }) => (
              <div key={etiqueta} className={styles.spec} data-vacio={valor === null || undefined}>
                <dt className={styles.specLabel}>{etiqueta}</dt>
                <dd className={styles.specValue}>
                  <Dato size={18} strokeWidth={1.75} aria-hidden="true" />
                  {valor ?? (
                    <>
                      <span aria-hidden="true">–</span>
                      <span className="sr-only">Sin dato</span>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Link>

      {/* Fuera del link: un botón no puede ir dentro de un <a> */}
      <div className={styles.foot}>
        <ShareButton
          path={`/propiedades/${p.slug}`}
          titulo={p.titulo}
          texto={`${p.titulo} - ${precioPublico(p)}`}
        />
      </div>
    </article>
  );
}

/* RESUMEN
   Card de propiedad (Server Component). Recibe `propiedad`, `prioridad` (solo la imagen LCP) y `nivel`
   del título. Imagen 4:3 (o placeholder con el ícono de la categoría), chip de categoría, precio, título,
   localidad, ficha fija de 4 datos (superficie, habitaciones, baños, cochera Sí/No) y botón Compartir.
   Depende de: components/ui/share-button.jsx, lib/{format,categories-meta}.js, property-card.module.css */
