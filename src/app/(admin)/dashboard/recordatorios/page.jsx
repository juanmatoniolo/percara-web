// src/app/(admin)/dashboard/recordatorios/page.jsx
import Link from 'next/link';
import { CircleCheck, Plus, Search } from 'lucide-react';
import RecordatorioRow from '@/components/admin/recordatorio-row';
import { requireAdmin } from '@/lib/auth';
import { hoyAR } from '@/lib/fechas';
import { listarRecordatorios } from '@/lib/queries/admin-recordatorios';
import { ESTADOS_RECORDATORIO } from '@/lib/schemas/recordatorio-etiquetas';
import styles from '../propiedades/page.module.css';

export const metadata = { title: 'Recordatorios' };

const AVISOS = { guardado: 'Recordatorio guardado.', borrado: 'Recordatorio borrado.' };

export default async function RecordatoriosPage({ searchParams }) {
  await requireAdmin();
  const { q = '', estado = '', aviso } = await searchParams;
  const res = await listarRecordatorios({ q: q || undefined, estado: estado || undefined });
  const filtrando = Boolean(q || estado);
  const hoy = hoyAR();

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Recordatorios</h1>
        <Link href="/dashboard/recordatorios/nuevo" className={styles.cta}>
          <Plus size={18} aria-hidden="true" />
          Nuevo
        </Link>
      </header>

      {AVISOS[aviso] && (
        <p className={styles.aviso} role="status">
          <CircleCheck size={18} aria-hidden="true" />
          {AVISOS[aviso]}
        </p>
      )}

      <form className={styles.filters} role="search" aria-label="Buscar recordatorios">
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Buscar por título</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por título"
            className={styles.input}
          />
        </label>
        <label>
          <span className="sr-only">Estado</span>
          <select name="estado" defaultValue={estado} className={styles.input}>
            <option value="">Todos</option>
            {Object.entries(ESTADOS_RECORDATORIO).map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={styles.apply}>
          Buscar
        </button>
        {filtrando && (
          <Link href="/dashboard/recordatorios" className={styles.clear}>
            Limpiar
          </Link>
        )}
      </form>

      {!res.ok ? (
        <p className={styles.empty}>{res.error}</p>
      ) : res.data.length === 0 ? (
        <p className={styles.empty}>
          {filtrando
            ? 'No hay recordatorios con esa búsqueda.'
            : 'Todavía no hay recordatorios. Cargue el primer negocio cerrado: cliente, propiedad y cómo se pagó.'}
        </p>
      ) : (
        <>
          <p className={styles.count}>{res.data.length} recordatorios</p>
          <ul className={styles.list}>
            {res.data.map((r) => (
              <RecordatorioRow key={r.id} recordatorio={r} hoy={hoy} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* RESUMEN
   Listado de Recordatorios (Server Component, verifica admin): búsqueda por título y filtro por estado en la
   URL, aviso tras guardar o borrar y filas con pago y próxima cuota. Recibe searchParams.
   Depende de: components/admin/recordatorio-row.jsx, lib/{auth,fechas}.js,
   lib/queries/admin-recordatorios.js, ../propiedades/page.module.css (estilos compartidos del listado) */
