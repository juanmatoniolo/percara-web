// src/app/(admin)/dashboard/page.jsx
import Link from 'next/link';
import { ArrowRight, Eye, FileClock, Handshake, Plus, Star } from 'lucide-react';
import EstadoBadge from '@/components/admin/estado-badge';
import { requireAdmin } from '@/lib/auth';
import { listarPropiedadesAdmin, resumenAdmin } from '@/lib/queries/admin-properties';
import { formatPrecio } from '@/lib/format';
import styles from './page.module.css';

export const metadata = { title: 'Resumen' };

export default async function DashboardPage() {
  await requireAdmin();
  const [resumen, recientes] = await Promise.all([resumenAdmin(), listarPropiedadesAdmin()]);
  const r = resumen.ok ? resumen.data : null;

  const tarjetas = [
    {
      label: 'Publicadas',
      valor: r?.publicada,
      Icono: Eye,
      href: '/dashboard/propiedades?estado=publicada',
    },
    {
      label: 'Borradores',
      valor: r?.borrador,
      Icono: FileClock,
      href: '/dashboard/propiedades?estado=borrador',
    },
    {
      label: 'Vendidas',
      valor: r?.vendida,
      Icono: Handshake,
      href: '/dashboard/propiedades?estado=vendida',
    },
    { label: 'Destacadas', valor: r?.destacada, Icono: Star, href: '/dashboard/propiedades' },
  ];
  const ultimas = recientes.ok ? recientes.data.slice(0, 5) : [];

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Resumen</h1>
          <p className={styles.lead}>
            {r ? `${r.total} propiedades en total` : 'No se pudo cargar el resumen.'}
          </p>
        </div>
        <Link href="/dashboard/propiedades/nueva" className={styles.cta}>
          <Plus size={18} aria-hidden="true" />
          Nueva propiedad
        </Link>
      </header>

      <ul className={styles.stats}>
        {tarjetas.map(({ label, valor, Icono, href }) => (
          <li key={label}>
            <Link href={href} className={styles.stat}>
              <span className={styles.statIcon} aria-hidden="true">
                <Icono size={20} />
              </span>
              <span className={styles.statValue}>{valor ?? '–'}</span>
              <span className={styles.statLabel}>{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className={styles.panel} aria-labelledby="recientes-title">
        <div className={styles.panelHead}>
          <h2 id="recientes-title" className={styles.panelTitle}>
            Últimas modificadas
          </h2>
          <Link href="/dashboard/propiedades" className={styles.more}>
            Ver todas <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {ultimas.length === 0 ? (
          <p className={styles.empty}>Todavía no hay propiedades cargadas.</p>
        ) : (
          <ul className={styles.list}>
            {ultimas.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/propiedades/${p.id}`} className={styles.row}>
                  <span className={styles.rowTitle}>{p.titulo}</span>
                  <span className={styles.rowMeta}>
                    {p.categoria.nombre} · {formatPrecio(p.precio, p.moneda)}
                  </span>
                  <EstadoBadge estado={p.estado} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* RESUMEN
   Resumen del panel (Server Component, verifica admin): tarjetas con conteos por estado y destacadas
   (enlazan al listado filtrado), acceso a "Nueva propiedad" y las 5 últimas modificadas.
   Depende de: components/admin/estado-badge.jsx, lib/auth.js, lib/queries/admin-properties.js, page.module.css */
