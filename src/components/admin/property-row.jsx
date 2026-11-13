// src/components/admin/property-row.jsx
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, EyeOff, Pencil, Send, Star } from 'lucide-react';
import EstadoBadge from './estado-badge';
import DeleteButton from './delete-button';
import { alternarDestacada, cambiarEstado } from '@/actions/properties';
import { iconoCategoria } from '@/lib/categories-meta';
import { formatPrecio } from '@/lib/format';
import styles from './property-row.module.css';

/** @param {{ propiedad: any }} props  fila de listarPropiedadesAdmin */
export default function PropertyRow({ propiedad: p }) {
  const portada = Array.isArray(p.imagenes) ? p.imagenes[0] : null;
  const Icono = iconoCategoria(p.categoria.slug);
  const publicada = p.estado === 'publicada';

  return (
    <li className={styles.row}>
      <div className={styles.thumb}>
        {portada ? (
          <Image src={portada.url} alt="" fill sizes="5rem" className={styles.img} />
        ) : (
          <Icono size={24} aria-hidden="true" />
        )}
      </div>

      <div className={styles.info}>
        <Link href={`/dashboard/propiedades/${p.id}`} className={styles.title}>
          {p.titulo}
        </Link>
        <p className={styles.meta}>
          {p.categoria.nombre} · {formatPrecio(p.precio, p.moneda)}
          {p.mostrar_precio === false ? ' (oculto)' : ''}
          {p.localidad ? ` · ${p.localidad}` : ''}
        </p>
        <EstadoBadge estado={p.estado} />
      </div>

      <div className={styles.actions}>
        <form action={alternarDestacada}>
          <input type="hidden" name="id" value={p.id} />
          <input type="hidden" name="destacada" value={String(!p.destacada)} />
          <button
            type="submit"
            className={styles.icon}
            data-on={p.destacada || undefined}
            aria-pressed={p.destacada}
            aria-label={p.destacada ? 'Quitar de destacadas' : 'Marcar como destacada'}
            title={p.destacada ? 'Quitar de destacadas' : 'Destacar'}
          >
            <Star size={18} aria-hidden="true" />
          </button>
        </form>

        <form action={cambiarEstado}>
          <input type="hidden" name="id" value={p.id} />
          <input type="hidden" name="estado" value={publicada ? 'borrador' : 'publicada'} />
          <button
            type="submit"
            className={styles.icon}
            title={publicada ? 'Despublicar' : 'Publicar'}
          >
            {publicada ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Send size={18} aria-hidden="true" />
            )}
            <span className="sr-only">{publicada ? 'Despublicar' : 'Publicar'}</span>
          </button>
        </form>

        {publicada && (
          <a
            href={`/propiedades/${p.slug}`}
            target="_blank"
            rel="noopener"
            className={styles.icon}
            title="Ver en el sitio"
          >
            <ExternalLink size={18} aria-hidden="true" />
            <span className="sr-only">Ver en el sitio</span>
          </a>
        )}

        <Link href={`/dashboard/propiedades/${p.id}`} className={styles.icon} title="Editar">
          <Pencil size={18} aria-hidden="true" />
          <span className="sr-only">Editar</span>
        </Link>

        <DeleteButton id={p.id} titulo={p.titulo} className={`${styles.icon} ${styles.danger}`} />
      </div>
    </li>
  );
}

/* RESUMEN
   Fila del listado del panel (Server Component): miniatura o ícono, título (link a editar), categoría,
   precio, localidad y estado; acciones destacar, publicar/despublicar (Server Actions por form), ver en el
   sitio, editar y borrar. Depende de: estado-badge, delete-button, actions/properties.js, lib/*, module.css */
