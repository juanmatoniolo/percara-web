// src/components/admin/cliente-row.jsx
import Link from 'next/link';
import ContactButtons from './contact-buttons';
import Tag from './tag';
import { plural } from '@/lib/format';
import styles from './cliente-row.module.css';

const primerNombre = (n) => n.trim().split(/\s+/)[0];

/** @param {{ cliente: any }} props  fila de listarClientes */
export default function ClienteRow({ cliente: c }) {
  const vinculos = Array.isArray(c.vinculos) ? c.vinculos : [];
  const duenio = vinculos.filter((v) => v.rol === 'propietario').length;
  const compra = vinculos.length - duenio;
  const iniciales = c.nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <li className={styles.row} data-inactivo={!c.activo || undefined}>
      <span className={styles.avatar} aria-hidden="true">
        {iniciales}
      </span>

      <div className={styles.info}>
        <Link href={`/dashboard/clientes/${c.id}`} className={styles.name}>
          {c.nombre}
        </Link>
        <p className={styles.meta}>
          {[c.telefono, c.localidad].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
        </p>
        <div className={styles.tags}>
          {duenio > 0 && (
            <Tag tono="azul">{`Dueño de ${plural(duenio, 'propiedad', 'propiedades')}`}</Tag>
          )}
          {compra > 0 && <Tag tono="verde">{`Interesado en ${compra}`}</Tag>}
          {!c.activo && <Tag>Inactivo</Tag>}
        </div>
        {c.busca && <p className={styles.busca}>Busca: {c.busca}</p>}
      </div>

      <div className={styles.actions}>
        <ContactButtons
          telefono={c.telefono}
          nombre={c.nombre}
          mensaje={`Hola ${primerNombre(c.nombre)}, le escribo de Inmobiliaria Percara.`}
          compacto
        />
      </div>
    </li>
  );
}

/* RESUMEN
   Fila de la agenda de clientes (Server Component): iniciales, nombre (link a la ficha), teléfono y
   localidad, etiquetas de dueño / interesado / inactivo, qué busca y botones de WhatsApp y Llamar.
   Recibe `cliente`. Depende de: contact-buttons.jsx, tag.jsx, lib/format.js, cliente-row.module.css */
