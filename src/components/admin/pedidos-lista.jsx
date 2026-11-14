// src/components/admin/pedidos-lista.jsx
import PedidoItem from './pedido-item';
import { fechaLarga } from '@/lib/fechas';
import styles from './pedidos-lista.module.css';

/**
 * Vista lista de la Carpeta: pendientes agrupados (Atrasados, Hoy, Próximos, Sin fecha) y, plegados, los
 * hechos o cancelados de los últimos 30 días.
 * @param {{ pendientes: any[], cerrados: any[], hoy: string, volver: string }} props
 */
export default function PedidosLista({ pendientes, cerrados, hoy, volver }) {
  const grupos = [
    {
      id: 'atrasados',
      titulo: 'Atrasados',
      items: pendientes.filter((p) => p.fecha && p.fecha < hoy),
      atrasado: true,
    },
    {
      id: 'hoy',
      titulo: `Hoy, ${fechaLarga(hoy)}`,
      items: pendientes.filter((p) => p.fecha === hoy),
      sinFecha: true,
    },
    {
      id: 'proximos',
      titulo: 'Próximos',
      items: pendientes.filter((p) => p.fecha && p.fecha > hoy),
    },
    { id: 'sin-fecha', titulo: 'Sin fecha', items: pendientes.filter((p) => !p.fecha) },
  ];

  if (pendientes.length === 0 && cerrados.length === 0) {
    return (
      <p className={styles.empty}>
        La carpeta está vacía. Agregue su primer pedido: una llamada, una visita o algo para no
        olvidar.
      </p>
    );
  }

  return (
    <div className={styles.wrap}>
      {pendientes.length === 0 && <p className={styles.empty}>No hay pendientes. ¡Todo al día!</p>}

      {grupos
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <section
            key={g.id}
            className={styles.group}
            data-grupo={g.id}
            aria-labelledby={`g-${g.id}`}
          >
            <h2 id={`g-${g.id}`} className={styles.title}>
              {g.titulo}
              <span className={styles.count}>{g.items.length}</span>
            </h2>
            <ul className={styles.list}>
              {g.items.map((p) => (
                <PedidoItem
                  key={p.id}
                  pedido={p}
                  volver={volver}
                  atrasado={g.atrasado}
                  mostrarFecha={!g.sinFecha}
                />
              ))}
            </ul>
          </section>
        ))}

      {cerrados.length > 0 && (
        <details className={styles.closed}>
          <summary className={styles.summary}>
            Hechos y cancelados (últimos 30 días)
            <span className={styles.count}>{cerrados.length}</span>
          </summary>
          <ul className={styles.list}>
            {cerrados.map((p) => (
              <PedidoItem key={p.id} pedido={p} volver={volver} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/* RESUMEN
   Vista lista de la Carpeta de pedidos (Server Component): agrupa los pendientes por Atrasados, Hoy,
   Próximos y Sin fecha, y pliega los cerrados recientes. Recibe `pendientes`, `cerrados`, `hoy`
   (YYYY-MM-DD en Argentina) y `volver`. Depende de: pedido-item.jsx, lib/fechas.js, module.css */
