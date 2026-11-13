// src/app/(admin)/dashboard/propiedades/page.jsx
import Link from 'next/link';
import { CircleCheck, Plus, Search } from 'lucide-react';
import PropertyRow from '@/components/admin/property-row';
import { requireAdmin } from '@/lib/auth';
import { categoriasConId, listarPropiedadesAdmin } from '@/lib/queries/admin-properties';
import styles from './page.module.css';

export const metadata = { title: 'Propiedades' };

const AVISOS = {
  creada: 'Propiedad creada.',
  guardada: 'Cambios guardados.',
  borrada: 'Propiedad borrada.',
};

const ESTADOS = [
  ['', 'Todos los estados'],
  ['publicada', 'Publicadas'],
  ['borrador', 'Borradores'],
  ['vendida', 'Vendidas'],
];

export default async function PropiedadesAdminPage({ searchParams }) {
  await requireAdmin();
  const { estado = '', categoria = '', q = '', aviso } = await searchParams;
  const [res, categorias] = await Promise.all([
    listarPropiedadesAdmin({
      estado: estado || undefined,
      categoria: categoria || undefined,
      q: q || undefined,
    }),
    categoriasConId(),
  ]);
  const filtrando = Boolean(estado || categoria || q);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Propiedades</h1>
        <Link href="/dashboard/propiedades/nueva" className={styles.cta}>
          <Plus size={18} aria-hidden="true" />
          Nueva
        </Link>
      </header>

      {AVISOS[aviso] && (
        <p className={styles.aviso} role="status">
          <CircleCheck size={18} aria-hidden="true" />
          {AVISOS[aviso]}
        </p>
      )}

      <form className={styles.filters} role="search" aria-label="Filtrar propiedades">
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
            {ESTADOS.map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Categoría</span>
          <select name="categoria" defaultValue={categoria} className={styles.input}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={styles.apply}>
          Filtrar
        </button>
        {filtrando && (
          <Link href="/dashboard/propiedades" className={styles.clear}>
            Limpiar
          </Link>
        )}
      </form>

      {!res.ok ? (
        <p className={styles.empty}>{res.error}</p>
      ) : res.data.length === 0 ? (
        <p className={styles.empty}>
          {filtrando
            ? 'No hay propiedades con esos filtros.'
            : 'Todavía no hay propiedades. Cree la primera.'}
        </p>
      ) : (
        <>
          <p className={styles.count}>{res.data.length} resultados</p>
          <ul className={styles.list}>
            {res.data.map((p) => (
              <PropertyRow key={p.id} propiedad={p} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* RESUMEN
   Listado del panel (Server Component, verifica admin): aviso tras crear/guardar/borrar, filtros GET
   (título, estado, categoría) compartibles por URL y filas con acciones. Recibe searchParams.
   Depende de: components/admin/property-row.jsx, lib/auth.js, lib/queries/admin-properties.js, page.module.css */
