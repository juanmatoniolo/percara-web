// src/components/admin/vinculo-item.jsx
import Link from 'next/link';
import { Check, Unlink } from 'lucide-react';
import ConfirmForm from './confirm-form';
import ContactButtons from './contact-buttons';
import Tag, { TONOS } from './tag';
import { cambiarEstadoInteres, desvincularPropiedad } from '@/actions/clientes';
import { ESTADOS_INTERES, ROLES } from '@/lib/schemas/agenda-etiquetas';
import { SITE_URL } from '@/lib/seo';
import styles from './vinculo-item.module.css';

/** Mensaje de WhatsApp según el rol: al dueño por "su" propiedad; al comprador, con el link si está publicada. */
function mensaje(rol, cliente, propiedad) {
  const hola = `Hola ${cliente.nombre.trim().split(/\s+/)[0]}, le escribo de Inmobiliaria Percara`;
  if (rol === 'propietario') return `${hola} por su propiedad "${propiedad.titulo}".`;
  const link =
    propiedad.estado === 'publicada' && propiedad.slug
      ? `: ${new URL(`/propiedades/${propiedad.slug}`, SITE_URL)}`
      : '.';
  return `${hola} por la propiedad "${propiedad.titulo}"${link}`;
}

/**
 * Un vínculo cliente <-> propiedad. En la ficha de la propiedad muestra al cliente; en la del cliente,
 * la propiedad. Siempre con WhatsApp/Llamar al cliente y, si es comprador, su seguimiento.
 * @param {{ modo: 'propiedad' | 'cliente', cliente: any, propiedad: any, rol: string, estado: string | null, notas?: string | null }} props
 */
export default function VinculoItem({ modo, cliente, propiedad, rol, estado, notas }) {
  const ids = { cliente_id: cliente.id, propiedad_id: propiedad.id };
  const titulo =
    modo === 'propiedad'
      ? { href: `/dashboard/clientes/${cliente.id}`, texto: cliente.nombre }
      : { href: `/dashboard/propiedades/${propiedad.id}`, texto: propiedad.titulo };

  return (
    <li className={styles.item}>
      <div className={styles.head}>
        <Link href={titulo.href} className={styles.name}>
          {titulo.texto}
        </Link>
        <Tag tono={TONOS[rol]}>{ROLES[rol]}</Tag>
        {estado && <Tag tono={TONOS[estado]}>{ESTADOS_INTERES[estado]}</Tag>}
      </div>
      {modo === 'propiedad' && cliente.telefono && (
        <p className={styles.meta}>{cliente.telefono}</p>
      )}
      {notas && <p className={styles.notas}>{notas}</p>}

      <div className={styles.actions}>
        <ContactButtons
          telefono={cliente.telefono}
          nombre={cliente.nombre}
          mensaje={mensaje(rol, cliente, propiedad)}
        />

        <div className={styles.tools}>
          {rol === 'comprador' && (
            <form action={cambiarEstadoInteres} className={styles.estado}>
              <input type="hidden" name="cliente_id" value={cliente.id} />
              <input type="hidden" name="propiedad_id" value={propiedad.id} />
              <label className="sr-only" htmlFor={`e-${cliente.id}-${propiedad.id}`}>
                Seguimiento
              </label>
              <select
                id={`e-${cliente.id}-${propiedad.id}`}
                name="estado"
                defaultValue={estado ?? 'interesado'}
                className={styles.select}
              >
                {Object.entries(ESTADOS_INTERES).map(([v, t]) => (
                  <option key={v} value={v}>
                    {t}
                  </option>
                ))}
              </select>
              <button type="submit" className={styles.icon} title="Guardar seguimiento">
                <Check size={18} aria-hidden="true" />
                <span className="sr-only">Guardar seguimiento</span>
              </button>
            </form>
          )}
          <ConfirmForm
            action={desvincularPropiedad}
            campos={ids}
            mensaje={`¿Quitar a ${cliente.nombre} de "${propiedad.titulo}"?`}
            etiqueta="Quitar vínculo"
            className={`${styles.icon} ${styles.danger}`}
          >
            <Unlink size={18} aria-hidden="true" />
          </ConfirmForm>
        </div>
      </div>
    </li>
  );
}

/* RESUMEN
   Vínculo cliente <-> propiedad (Server Component): nombre o título con link, rol y seguimiento, notas,
   WhatsApp/Llamar con mensaje según el rol, selector de seguimiento (compradores) y quitar con
   confirmación. Depende de: confirm-form, contact-buttons, tag, actions/clientes.js, lib/seo.js, module.css */
