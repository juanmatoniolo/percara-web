// src/app/(admin)/dashboard/clientes/page.jsx
import Link from 'next/link';
import { CircleCheck, Search, UserPlus } from 'lucide-react';
import ClienteRow from '@/components/admin/cliente-row';
import { requireAdmin } from '@/lib/auth';
import { listarClientes } from '@/lib/queries/admin-clientes';
import styles from '../propiedades/page.module.css';

export const metadata = { title: 'Clientes' };

const AVISOS = { borrado: 'Cliente borrado.' };

const ROLES = [
  ['', 'Todos'],
  ['propietario', 'Dueños'],
  ['comprador', 'Compradores'],
];

export default async function ClientesPage({ searchParams }) {
  await requireAdmin();
  const { q = '', rol = '', aviso } = await searchParams;
  const res = await listarClientes({ q: q || undefined, rol: rol || undefined });
  const filtrando = Boolean(q || rol);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Clientes</h1>
        <Link href="/dashboard/clientes/nuevo" className={styles.cta}>
          <UserPlus size={18} aria-hidden="true" />
          Nuevo
        </Link>
      </header>

      {AVISOS[aviso] && (
        <p className={styles.aviso} role="status">
          <CircleCheck size={18} aria-hidden="true" />
          {AVISOS[aviso]}
        </p>
      )}

      <form className={styles.filters} role="search" aria-label="Buscar clientes">
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Buscar por nombre, teléfono, DNI o localidad</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Nombre, teléfono, DNI o localidad"
            className={styles.input}
          />
        </label>
        <label>
          <span className="sr-only">Tipo de cliente</span>
          <select name="rol" defaultValue={rol} className={styles.input}>
            {ROLES.map(([v, t]) => (
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
          <Link href="/dashboard/clientes" className={styles.clear}>
            Limpiar
          </Link>
        )}
      </form>

      {!res.ok ? (
        <p className={styles.empty}>{res.error}</p>
      ) : res.data.length === 0 ? (
        <p className={styles.empty}>
          {filtrando
            ? 'No hay clientes con esa búsqueda.'
            : 'La agenda está vacía. Cargue el primer cliente: un dueño que vende o alguien que busca.'}
        </p>
      ) : (
        <>
          <p className={styles.count}>{res.data.length} clientes</p>
          <ul className={styles.list}>
            {res.data.map((c) => (
              <ClienteRow key={c.id} cliente={c} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* RESUMEN
   Agenda de clientes (Server Component, verifica admin): búsqueda por nombre/teléfono/DNI/localidad y
   filtro dueños/compradores por URL, aviso tras borrar y filas con WhatsApp/Llamar. Recibe searchParams.
   Depende de: components/admin/cliente-row.jsx, lib/auth.js, lib/queries/admin-clientes.js,
   ../propiedades/page.module.css (estilos compartidos del listado) */
