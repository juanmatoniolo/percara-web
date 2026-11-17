// src/components/admin/recordatorio-detalle.jsx
import Link from 'next/link';
import { CalendarClock, Home, NotebookPen, User, Wallet } from 'lucide-react';
import { formatPrecio } from '@/lib/format';
import { fechaLarga } from '@/lib/fechas';
import { calendarioCuotas, proximaCuota } from '@/lib/cuotas';
import { CON_CUOTAS, FORMAS_PAGO, MEDIOS_PAGO } from '@/lib/schemas/recordatorio-etiquetas';
import styles from './recordatorio-detalle.module.css';

const conAnio = (iso) => (iso ? `${fechaLarga(iso)} de ${iso.slice(0, 4)}` : null);
const corta = (iso) => iso.split('-').reverse().join('/');
const monto = (n, moneda) => (n ? formatPrecio(n, moneda) : null);

/** Fila de la lista de datos: no se muestra si no hay valor. */
function Dato({ label, children }) {
  if (children === null || children === undefined || children === '') return null;
  return (
    <div className={styles.dato}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * Vista de solo lectura de un recordatorio (Server Component): negocio, pago, cuotas y observaciones.
 * @param {{ recordatorio: import('@/types').Recordatorio & { cliente?: any, propiedad?: any }, hoy: string }} props
 */
export default function RecordatorioDetalle({ recordatorio: r, hoy }) {
  const conCuotas = CON_CUOTAS.has(r.forma_pago);
  const monedaCuotas = r.moneda_cuotas ?? r.moneda;
  const cuotas = conCuotas ? calendarioCuotas(r) : [];
  const proxima = conCuotas && r.estado === 'en_curso' ? proximaCuota(r, hoy) : null;
  const saldo =
    r.monto_total && r.anticipo && r.anticipo < r.monto_total ? r.monto_total - r.anticipo : null;

  return (
    <div className={styles.grid}>
      <section className={styles.card} aria-labelledby="neg-titulo">
        <h2 id="neg-titulo" className={styles.h2}>
          <User size={20} aria-hidden="true" />
          Negocio
        </h2>
        <dl className={styles.datos}>
          <Dato label="Fecha">{conAnio(r.fecha_operacion)}</Dato>
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
        {!r.fecha_operacion && !r.cliente && !r.propiedad && (
          <p className={styles.empty}>Sin fecha, cliente ni propiedad vinculados.</p>
        )}
      </section>

      <section className={styles.card} aria-labelledby="pago-titulo">
        <h2 id="pago-titulo" className={styles.h2}>
          <Wallet size={20} aria-hidden="true" />
          Cómo se pagó
        </h2>
        <dl className={styles.datos}>
          <Dato label="Forma de pago">{FORMAS_PAGO[r.forma_pago]}</Dato>
          <Dato label="Medio de pago">{r.medio_pago && MEDIOS_PAGO[r.medio_pago]}</Dato>
          <Dato label="Monto total">{monto(r.monto_total, r.moneda)}</Dato>
          <Dato label="Anticipo / seña">{monto(r.anticipo, r.moneda)}</Dato>
          <Dato label="Saldo">{monto(saldo, r.moneda)}</Dato>
          {conCuotas && (
            <>
              <Dato label="Cuotas">
                {r.cantidad_cuotas &&
                  `${r.cantidad_cuotas}${r.monto_cuota ? ` de ${formatPrecio(r.monto_cuota, monedaCuotas)}` : ''}`}
              </Dato>
              <Dato label="Primer vencimiento">{conAnio(r.primer_vencimiento)}</Dato>
            </>
          )}
        </dl>
      </section>

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

      <section className={styles.card} aria-labelledby="obs-titulo">
        <h2 id="obs-titulo" className={styles.h2}>
          <NotebookPen size={20} aria-hidden="true" />
          Observaciones
        </h2>
        {r.observaciones ? (
          <p className={styles.obs}>{r.observaciones}</p>
        ) : (
          <p className={styles.empty}>Sin observaciones.</p>
        )}
      </section>
    </div>
  );
}

/* RESUMEN
   Vista de solo lectura de un recordatorio (Server Component): tarjetas de negocio (fecha, cliente y propiedad
   con links), cómo se pagó (con saldo), calendario de cuotas desplegable con la próxima marcada y observaciones
   completas. Recibe `recordatorio` y `hoy`. Depende de: lib/{format,fechas,cuotas}.js,
   lib/schemas/recordatorio-etiquetas.js, recordatorio-detalle.module.css */
