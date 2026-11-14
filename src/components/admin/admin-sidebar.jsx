// src/components/admin/admin-sidebar.jsx
import {
  ExternalLink,
  FolderOpen,
  House,
  LayoutDashboard,
  LogOut,
  Plus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import NavLink from '@/components/layout/nav-link';
import { cerrarSesion } from '@/actions/auth';
import styles from './admin-sidebar.module.css';

const LINKS = [
  { href: '/dashboard', label: 'Resumen', Icono: LayoutDashboard, exact: true },
  { href: '/dashboard/propiedades', label: 'Propiedades', Icono: House, exact: false },
  { href: '/dashboard/clientes', label: 'Clientes', Icono: Users, exact: false },
  { href: '/dashboard/pedidos', label: 'Carpeta de pedidos', Icono: FolderOpen, exact: false },
];

/** @param {{ email: string }} props */
export default function AdminSidebar({ email }) {
  return (
    <header className={styles.bar}>
      <p className={styles.brand}>
        Percara <span>Panel</span>
      </p>

      <nav className={styles.nav} aria-label="Panel">
        <ul className={styles.list}>
          {LINKS.map(({ href, label, Icono, exact }) => (
            <li key={href}>
              <NavLink href={href} exact={exact} className={styles.link}>
                <Icono size={18} aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Link href="/dashboard/propiedades/nueva" className={styles.cta}>
          <Plus size={18} aria-hidden="true" />
          Nueva propiedad
        </Link>
      </nav>

      <div className={styles.foot}>
        <a href="/" target="_blank" rel="noopener" className={styles.link}>
          <ExternalLink size={18} aria-hidden="true" />
          Ver sitio
        </a>
        <p className={styles.user} title={email}>
          {email}
        </p>
        <form action={cerrarSesion}>
          <button type="submit" className={styles.logout}>
            <LogOut size={18} aria-hidden="true" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  );
}

/* RESUMEN
   Barra del panel (Server Component): marca, links Resumen/Propiedades/Clientes/Carpeta de pedidos con estado activo, botón "Nueva
   propiedad", ver sitio, email del admin y cerrar sesión (Server Action). Recibe `email`.
   Depende de: components/layout/nav-link.jsx, actions/auth.js, admin-sidebar.module.css */
