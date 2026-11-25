// src/components/admin/recordatorio-row.jsx
import Link from 'next/link';
import { CalendarClock, Home, User } from 'lucide-react';
import Tag from './tag';
import { formatPrecio } from '@/lib/format';
import { fechaLarga } from '@/lib/fechas';
import { proximaCuota } from '@/lib/cuotas';
import {
  CON_CUOTAS,
  ESTADOS_RECORDATORIO,
  FORMAS_PAGO,
  MEDIOS_PAGO,
} from '@/lib/schemas/recordatorio-etiquetas';
import styles from './recordatorio-row.module.css';

const TONO_ESTADO = { en_curso: 'ambar', finalizado: 'verde', cancelado: 'gris' };
const monto = (n, moneda) => (n ? formatPrecio(n, moneda) : null);

/**
 * Fila de Recordatorios (Server Component): título, cliente, propiedad, cómo se pagó y próxima cuota.
 * @param {{ recordatorio: import('@/types').Recordatorio & { cliente?: any, propiedad?: any }, hoy: string }} props
 */
export default function RecordatorioRow({ recordatorio: r, hoy }) {
  const cuota =
    r.estado === 'en_curso' && CON_CUOTAS.has(r.forma_pago) ? proximaCuota(r, hoy) : null;
  const monedaCuotas = r.moneda_cuotas ?? r.moneda;
  const pago = [
    FORMAS_PAGO[r.forma_pago],
    r.medio_pago && MEDIOS_PAGO[r.medio_pago],
    monto(r.monto_total, r.moneda),
    r.anticipo ? `anticipo ${formatPrecio(r.anticipo, r.moneda)}` : null,
    r.cantidad_cuotas
      ? `${r.cantidad_cuotas} cuotas${r.monto_cuota ? ` de ${formatPrecio(r.monto_cuota, monedaCuotas)}` : ''}`
      : null,
  ].filter(Boolean);

  return (
    <li className={styles.row}>
      <div className={styles.head}>
        <Link href={`/dashboard/recordatorios/${r.id}`} className={styles.title}>
          {r.titulo}
        </Link>
        <Tag tono={TONO_ESTADO[r.estado]}>{ESTADOS_RECORDATORIO[r.estado]}</Tag>
      </div>
      {r.fecha_operacion && <p className={styles.fecha}>{fechaLarga(r.fecha_operacion)}</p>}

      <ul className={styles.vinculos}>
        {r.cliente && (
          <li>
            <User size={16} aria-hidden="true" />
            <Link href={`/dashboard/clientes/${r.cliente.id}`}>{r.cliente.nombre}</Link>
          </li>
        )}
        {r.propiedad && (
          <li>
            <Home size={16} aria-hidden="true" />
            <Link href={`/dashboard/propiedades/${r.propiedad.id}`}>{r.propiedad.titulo}</Link>
          </li>
        )}
      </ul>

      <p className={styles.pago}>{pago.join(' · ')}</p>

      {cuota && (
        <p className={styles.cuota} data-terminadas={cuota.terminadas || undefined}>
          <CalendarClock size={16} aria-hidden="true" />
          {cuota.terminadas
            ? `Última cuota: ${fechaLarga(cuota.fecha)}. ¿Marcar como finalizado?`
            : `Próxima cuota (${cuota.numero} de ${cuota.total}): ${fechaLarga(cuota.fecha)}`}
        </p>
      )}
      {r.observaciones && <p className={styles.obs}>{r.observaciones}</p>}
    </li>
  );
}

/* RESUMEN
   Fila de Recordatorios (Server Component): título (su link cubre toda la tarjeta y abre la vista) con estado, fecha, links al cliente y a la
   propiedad, resumen del pago y próxima cuota calculada (o aviso si ya pasaron todas) y observaciones.
   Recibe `recordatorio` y `hoy`. Depende de: tag.jsx, lib/{format,fechas,cuotas}.js,
   lib/schemas/recordatorio-etiquetas.js, recordatorio-row.module.css */
