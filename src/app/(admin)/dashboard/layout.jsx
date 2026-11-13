// src/app/(admin)/dashboard/layout.jsx
import AdminSidebar from '@/components/admin/admin-sidebar';
import { requireAdmin } from '@/lib/auth';
import styles from './layout.module.css';

export const metadata = {
  title: { default: 'Panel', template: '%s | Panel Percara' },
  robots: { index: false, follow: false, nocache: true },
};

/* El panel siempre se renderiza por request (sesión en cookies, datos sin caché) */
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const admin = await requireAdmin();

  return (
    <div className={styles.shell}>
      <AdminSidebar email={admin.email} />
      <main id="contenido" className={styles.main}>
        {children}
      </main>
    </div>
  );
}

/* RESUMEN
   Layout del panel (Server Component dinámico, noindex): verifica admin (redirige a /login si no) y arma
   la estructura barra lateral + contenido. Recibe `children`.
   Depende de: components/admin/admin-sidebar.jsx, lib/auth.js, layout.module.css */
