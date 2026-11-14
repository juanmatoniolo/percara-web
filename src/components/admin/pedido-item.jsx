// src/components/admin/pedido-item.jsx
import Link from 'next/link';
import { Check, Clock, House, Pencil, RotateCcw, User } from 'lucide-react';
import ContactButtons from './contact-buttons';
import Tag, { TONOS } from './tag';
import { cambiarEstadoPedido } from '@/actions/pedidos';
import { ESTADOS_PEDIDO, PRIORIDADES } from '@/lib/schemas/agenda-etiquetas';
import { fechaLarga, horaCorta } from '@/lib/fechas';
import styles from './pedido-item.module.css';

/**
 * Un pedido de la Carpeta: casilla para marcarlo hecho, título, cuándo, con quién y contacto directo.
 * @param {{ pedido: any, volver: string, mostrarFecha?: boolean, atrasado?: boolean }} props
 */
export default function PedidoItem({ pedido: p, volver, mostrarFecha = true, atrasado = false }) {
  const hecho = p.estado === 'hecho';
  const cuando = [mostrarFecha && p.fecha ? fechaLarga(p.fecha) : '', horaCorta(p.hora)]
    .filter(Boolean)
    .join(' · ');
  const editar = `/dashboard/pedidos/${p.id}?volver=${encodeURIComponent(volver)}`;

  return (
    <li className={styles.item} data-estado={p.estado} data-atrasado={atrasado || undefined}>
      <form action={cambiarEstadoPedido} className={styles.checkForm}>
        <input type="hidden" name="id" value={p.id} />
        <input type="hidden" name="estado" value={hecho ? 'pendiente' : 'hecho'} />
        <button
          type="submit"
          className={styles.check}
          aria-pressed={hecho}
          title={hecho ? 'Volver a pendiente' : 'Marcar como hecho'}
        >
          {hecho ? (
            <RotateCcw size={18} aria-hidden="true" />
          ) : (
            <Check size={18} aria-hidden="true" />
          )}
          <span className="sr-only">
            {hecho ? `Volver a pendiente: ${p.titulo}` : `Marcar como hecho: ${p.titulo}`}
          </span>
        </button>
      </form>

      <div className={styles.body}>
        <div className={styles.head}>
          <Link href={editar} className={styles.title}>
            {p.titulo}
          </Link>
          {p.prioridad !== 'normal' && (
            <Tag
              tono={TONOS[p.prioridad]}
            >{`Prioridad ${PRIORIDADES[p.prioridad].toLowerCase()}`}</Tag>
          )}
          {p.estado !== 'pendiente' && <Tag tono={TONOS[p.estado]}>{ESTADOS_PEDIDO[p.estado]}</Tag>}
        </div>

        {(cuando || atrasado) && (
          <p className={styles.meta}>
            <Clock size={14} aria-hidden="true" />
            {atrasado && <strong className={styles.late}>Atrasado</strong>}
            {cuando}
          </p>
        )}
        {p.detalle && <p className={styles.detalle}>{p.detalle}</p>}

        {(p.cliente || p.propiedad) && (
          <div className={styles.rel}>
            {p.cliente && (
              <Link href={`/dashboard/clientes/${p.cliente.id}`} className={styles.chip}>
                <User size={14} aria-hidden="true" />
                {p.cliente.nombre}
              </Link>
            )}
            {p.propiedad && (
              <Link href={`/dashboard/propiedades/${p.propiedad.id}`} className={styles.chip}>
                <House size={14} aria-hidden="true" />
                {p.propiedad.titulo}
              </Link>
            )}
          </div>
        )}
        {p.cliente && !hecho && (
          <ContactButtons
            telefono={p.cliente.telefono}
            nombre={p.cliente.nombre}
            mensaje={`Hola ${p.cliente.nombre.trim().split(/\s+/)[0]}, le escribo de Inmobiliaria Percara.`}
            compacto
          />
        )}
      </div>

      <Link href={editar} className={styles.edit} title="Editar">
        <Pencil size={18} aria-hidden="true" />
        <span className="sr-only">Editar {p.titulo}</span>
      </Link>
    </li>
  );
}

/* RESUMEN
   Pedido de la Carpeta (Server Component): botón para marcar hecho/pendiente (Server Action), título con
   link a editar, prioridad, fecha y hora (o "Atrasado"), detalle, cliente y propiedad, y WhatsApp/Llamar
   al cliente. Recibe `pedido`, `volver`, `mostrarFecha`, `atrasado`. Depende de: contact-buttons, tag, lib/fechas */
