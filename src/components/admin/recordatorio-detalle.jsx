// src/components/admin/recordatorio-detalle.jsx
import Link from 'next/link';
import { CalendarClock, Home, NotebookPen, User, Wallet } from 'lucide-react';
import RecordatorioTarjeta from './recordatorio-tarjeta';
import { formatPrecio } from '@/lib/format';
import { fechaLarga } from '@/lib/fechas';
import { calendarioCuotas, proximaCuota } from '@/lib/cuotas';
import {
  CON_CUOTAS,
  ESTADOS_RECORDATORIO,
  FORMAS_PAGO,
  MEDIOS_PAGO,
} from '@/lib/schemas/recordatorio-etiquetas';
import styles from './recordatorio-detalle.module.css';

const conAnio = (iso) => (iso ? `${fechaLarga(iso)} de ${iso.slice(0, 4)}` : null);
const corta = (iso) => iso.split('-').reverse().join('/');
const monto = (n, moneda) => (n ? formatPrecio(n, moneda) : null);

/** Fila de la lista de datos: si no hay valor muestra "Sin indicar" (se ve qué falta cargar). */
function Dato({ label, children }) {
  const vacio =
    children === null || children === undefined || children === '' || children === false;
  return (
    <div className={styles.dato}>
      <dt>{label}</dt>
      <dd data-vacio={vacio || undefined}>{vacio ? 'Sin indicar' : children}</dd>
    </div>
  );
}

/** Cabecera de tarjeta (va como prop a la tarjeta cliente). */
const Cabecera = ({ icono: Icono, children }) => (
  <h2 className={styles.h2}>
    <Icono size={20} aria-hidden="true" />
    {children}
  </h2>
);

/**
 * Vista de un recordatorio (Server Component): negocio, pago, cuotas y observaciones. Negocio, pago y
 * observaciones se editan en el lugar con un clic (RecordatorioTarjeta).
 * @param {{ recordatorio: import('@/types').Recordatorio & { cliente?: any, propiedad?: any }, hoy: string,
 *   clientes: any[], propiedades: any[] }} props
 */
export default function RecordatorioDetalle({ recordatorio: r, hoy, clientes, propiedades }) {
  const conCuotas = CON_CUOTAS.has(r.forma_pago);
  const monedaCuotas = r.moneda_cuotas ?? r.moneda;
  const cuotas = conCuotas ? calendarioCuotas(r) : [];
  const proxima = conCuotas && r.estado === 'en_curso' ? proximaCuota(r, hoy) : null;
  /* Lo que necesita el editor (sin los objetos anidados, que no hacen falta en el navegador) */
  const { cliente: _c, propiedad: _p, ...datos } = r;
  const tarjeta = { recordatorio: datos };
  const saldo =
    r.monto_total && r.anticipo && r.anticipo < r.monto_total ? r.monto_total - r.anticipo : null;

  return (
    <div className={styles.grid}>
      <RecordatorioTarjeta
        seccion="negocio"
        nombre="Negocio"
        cabecera={<Cabecera icono={User}>Negocio</Cabecera>}
        clientes={clientes}
        propiedades={propiedades}
        {...tarjeta}
      >
        <dl className={styles.datos}>
          <Dato label="Fecha">{conAnio(r.fecha_operacion)}</Dato>
          <Dato label="Estado">{ESTADOS_RECORDATORIO[r.estado]}</Dato>
          <Dato label="Cliente">
            {r.cliente && (
              <Link href={`/dashboard/clientes/${r.cliente.id}`}>{r.cliente.nombre}</Link>
            )}
          </Dato>
          <Dato label="Propiedad">
            {r.propiedad && (
              <Link href={`/dashboard/propiedades/${r.propiedad.id}`} className={styles.prop}>
                <Home size={16} aria-hidden="true" />
                {r.propiedad.titulo}
              </Link>
            )}
          </Dato>
        </dl>
      </RecordatorioTarjeta>

      <RecordatorioTarjeta
        seccion="pago"
        nombre="Cómo se pagó"
        cabecera={<Cabecera icono={Wallet}>Cómo se pagó</Cabecera>}
        {...tarjeta}
      >
        <dl className={styles.datos}>
          <Dato label="Forma de pago">{FORMAS_PAGO[r.forma_pago]}</Dato>
          <Dato label="Medio de pago">{r.medio_pago && MEDIOS_PAGO[r.medio_pago]}</Dato>
          <Dato label="Moneda">{r.moneda}</Dato>
          <Dato label="Monto total">{monto(r.monto_total, r.moneda)}</Dato>
          <Dato label="Anticipo / seña">{monto(r.anticipo, r.moneda)}</Dato>
          {saldo && <Dato label="Saldo">{monto(saldo, r.moneda)}</Dato>}
          {conCuotas && (
            <>
              <Dato label="Cantidad de cuotas">{r.cantidad_cuotas}</Dato>
              <Dato label="Monto de cada cuota">{monto(r.monto_cuota, monedaCuotas)}</Dato>
              <Dato label="Primer vencimiento">{conAnio(r.primer_vencimiento)}</Dato>
            </>
          )}
        </dl>
      </RecordatorioTarjeta>

      {cuotas.length > 0 && (
        <section className={styles.card} aria-labelledby="cuotas-titulo">
          <h2 id="cuotas-titulo" className={styles.h2}>
            <CalendarClock size={20} aria-hidden="true" />
            Cuotas
          </h2>
          {proxima && (
            <p className={styles.proxima} data-terminadas={proxima.terminadas || undefined}>
              {proxima.terminadas
                ? `Ya venció la última cuota (${conAnio(proxima.fecha)}). Si está todo pagado, márquelo como finalizado.`
                : `Próxima: cuota ${proxima.numero} de ${proxima.total}, ${conAnio(proxima.fecha)}.`}
            </p>
          )}
          <details className={styles.calendario}>
            <summary>Ver las {cuotas.length} fechas</summary>
            <ol className={styles.lista}>
              {cuotas.map((c) => (
                <li
                  key={c.numero}
                  data-pasada={c.fecha < hoy || undefined}
                  data-proxima={
                    proxima?.numero === c.numero && !proxima.terminadas ? '' : undefined
                  }
                >
                  <span>Cuota {c.numero}</span>
                  <time dateTime={c.fecha}>{corta(c.fecha)}</time>
                </li>
              ))}
            </ol>
          </details>
        </section>
      )}

      <RecordatorioTarjeta
        seccion="observaciones"
        nombre="Observaciones"
        cabecera={<Cabecera icono={NotebookPen}>Observaciones</Cabecera>}
        {...tarjeta}
      >
        {r.observaciones ? (
          <p className={styles.obs}>{r.observaciones}</p>
        ) : (
          <p className={styles.empty}>Sin observaciones. Toque para agregar.</p>
        )}
      </RecordatorioTarjeta>
    </div>
  );
}

/* RESUMEN
   Vista de un recordatorio (Server Component): tarjetas de negocio, cómo se pagó y observaciones con todos
   sus datos ("Sin indicar" si faltan) que se editan con un clic, y calendario de cuotas con la próxima
   marcada. Recibe `recordatorio`, `hoy`, `clientes` y `propiedades`. Depende de: recordatorio-tarjeta.jsx,
   lib/{format,fechas,cuotas}.js,
   lib/schemas/recordatorio-etiquetas.js, recordatorio-detalle.module.css */
