// src/components/admin/admin-sidebar.jsx
import {
  BellRing,
  Building2,
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
  {
    href: '/dashboard/pedidos',
    label: 'Carpeta de pedidos',
    corto: 'Pedidos',
    Icono: FolderOpen,
    exact: false,
  },
  { href: '/dashboard/recordatorios', label: 'Recordatorios', Icono: BellRing, exact: false },
  {
    href: '/dashboard/configuracion',
    label: 'Datos de la inmobiliaria',
    corto: 'Datos',
    Icono: Building2,
    exact: false,
  },
];

/** @param {{ email: string }} props */
export default function AdminSidebar({ email }) {
  /* Móvil: .bar y .top son display: contents; la fila de marca se va con el scroll y solo la fila de
     solapas (.nav) queda pegada arriba. Desde 1024px: barra lateral (orden con `order` en el CSS). */
  return (
    <div className={styles.bar}>
      <header className={styles.top}>
        <p className={styles.brand}>
          Percara <span>Panel</span>
        </p>
        <Link
          href="/dashboard/propiedades/nueva"
          className={styles.cta}
          aria-label="Nueva propiedad"
        >
          <Plus size={18} aria-hidden="true" />
          <span className={styles.ctaTexto}>Nueva propiedad</span>
          <span className={styles.ctaCorto} aria-hidden="true">
            Nueva
          </span>
        </Link>
        <div className={styles.foot}>
          <a href="/" target="_blank" rel="noopener" className={styles.link}>
            <ExternalLink size={18} aria-hidden="true" />
            Ver sitio
          </a>
          <p className={styles.user} title={email}>
            {email}
          </p>
          <form action={cerrarSesion}>
            <button type="submit" className={styles.logout} aria-label="Cerrar sesión">
              <LogOut size={18} aria-hidden="true" />
              <span className={styles.logoutTexto}>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </header>

      <nav className={styles.nav} aria-label="Panel">
        <ul className={styles.list}>
          {LINKS.map(({ href, label, corto, Icono, exact }) => (
            <li key={href}>
              <NavLink href={href} exact={exact} className={styles.link} alVista>
                <Icono size={18} aria-hidden="true" />
                <span className={corto ? styles.largo : undefined}>{label}</span>
                {/* Se muestra uno u otro con display: el oculto tampoco se lee */}
                {corto && <span className={styles.corto}>{corto}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/* RESUMEN
   Barra del panel (Server Component): marca, "Nueva propiedad", ver sitio, email y cerrar sesión, más
   las solapas Resumen/Propiedades/Clientes/Pedidos/Recordatorios/Datos con estado activo. En móvil solo
   la fila de solapas queda fija arriba. Recibe `email`.
   Depende de: components/layout/nav-link.jsx, actions/auth.js, admin-sidebar.module.css */
