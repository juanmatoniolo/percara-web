// src/components/admin/pedidos-calendario.jsx
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { DIAS_CORTOS, fechaLarga, grillaMes, horaCorta, moverMes, nombreMes } from '@/lib/fechas';
import styles from './pedidos-calendario.module.css';

const MAX_POR_DIA = 3;

/**
 * Vista calendario mensual de la Carpeta (sin JS: navegación por links). En móvil muestra solo los días
 * con pedidos, como agenda; desde 768px, la grilla de lunes a domingo.
 * @param {{ mes: string, pedidos: any[], hoy: string }} props  mes "YYYY-MM"
 */
export default function PedidosCalendario({ mes, pedidos, hoy }) {
  const { celdas } = grillaMes(mes);
  const porDia = pedidos.reduce(
    (m, p) => m.set(p.fecha, [...(m.get(p.fecha) ?? []), p]),
    /** @type {Map<string, any[]>} */ (new Map()),
  );
  const volver = `/dashboard/pedidos?vista=calendario&mes=${mes}`;
  const vacio = pedidos.length === 0;

  return (
    <section className={styles.cal} aria-labelledby="cal-mes">
      <header className={styles.nav}>
        <Link
          href={`/dashboard/pedidos?vista=calendario&mes=${moverMes(mes, -1)}`}
          className={styles.arrow}
        >
          <ChevronLeft size={20} aria-hidden="true" />
          <span className="sr-only">Mes anterior</span>
        </Link>
        <h2 id="cal-mes" className={styles.month}>
          {nombreMes(mes)}
        </h2>
        <Link
          href={`/dashboard/pedidos?vista=calendario&mes=${moverMes(mes, 1)}`}
          className={styles.arrow}
        >
          <ChevronRight size={20} aria-hidden="true" />
          <span className="sr-only">Mes siguiente</span>
        </Link>
        {mes !== hoy.slice(0, 7) && (
          <Link href="/dashboard/pedidos?vista=calendario" className={styles.today}>
            Hoy
          </Link>
        )}
      </header>

      {vacio && <p className={styles.empty}>No hay pedidos con fecha en este mes.</p>}

      <ol className={styles.grid} data-vacio={vacio || undefined}>
        {DIAS_CORTOS.map((d) => (
          <li key={d} className={styles.dow} aria-hidden="true">
            {d}
          </li>
        ))}
        {celdas.map((fecha, i) => {
          if (!fecha) return <li key={`x${i}`} className={styles.pad} aria-hidden="true" />;
          const items = porDia.get(fecha) ?? [];
          const extra = items.length - MAX_POR_DIA;
          return (
            <li
              key={fecha}
              className={styles.day}
              data-hoy={fecha === hoy || undefined}
              data-con={items.length > 0 || undefined}
              data-pasado={fecha < hoy || undefined}
            >
              <div className={styles.dayHead}>
                <span className={styles.num}>
                  <span className={styles.numCorto} aria-hidden="true">
                    {Number(fecha.slice(8))}
                  </span>
                  <span className={styles.numLargo}>{fechaLarga(fecha)}</span>
                </span>
                <Link
                  href={`/dashboard/pedidos/nuevo?fecha=${fecha}&volver=${encodeURIComponent(volver)}`}
                  className={styles.add}
                  title="Agregar pedido este día"
                >
                  <Plus size={16} aria-hidden="true" />
                  <span className="sr-only">Agregar pedido el {fechaLarga(fecha)}</span>
                </Link>
              </div>
              {items.length > 0 && (
                <ul className={styles.items}>
                  {items.slice(0, MAX_POR_DIA).map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/dashboard/pedidos/${p.id}?volver=${encodeURIComponent(volver)}`}
                        className={styles.ev}
                        data-prioridad={p.prioridad}
                        data-estado={p.estado}
                      >
                        {p.hora && <time className={styles.hora}>{horaCorta(p.hora)}</time>}
                        {p.titulo}
                      </Link>
                    </li>
                  ))}
                  {extra > 0 && <li className={styles.more}>+{extra} más</li>}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* RESUMEN
   Calendario mensual de la Carpeta (Server Component): flechas de mes y "Hoy" por URL, grilla de lunes a
   domingo con hasta 3 pedidos por día (color por prioridad, tachado si está hecho) y "+" para agregar en
   esa fecha. Recibe `mes`, `pedidos`, `hoy`. Depende de: lib/fechas.js, pedidos-calendario.module.css */
