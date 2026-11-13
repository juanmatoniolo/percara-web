// src/components/property/category-tabs.jsx
import Link from 'next/link';
import { LayoutList } from 'lucide-react';
import { CATEGORIAS } from '@/lib/queries/categories';
import { iconoCategoria } from '@/lib/categories-meta';
import styles from './category-tabs.module.css';

/**
 * Pestañas de navegación por categoría ("Todas" + 9). Son links reales: cada una es una URL indexable.
 * @param {{ activa?: string, conteo?: Record<string, number> }} props  activa = slug o undefined (Todas)
 */
export default function CategoryTabs({ activa, conteo = {} }) {
  const total = Object.values(conteo).reduce((a, b) => a + b, 0);
  const tabs = [
    { slug: undefined, nombre: 'Todas', href: '/propiedades', Icono: LayoutList, n: total },
    ...CATEGORIAS.map((c) => ({
      slug: c.slug,
      nombre: c.nombre,
      href: `/categorias/${c.slug}`,
      Icono: iconoCategoria(c.slug),
      n: conteo[c.slug] ?? 0,
    })),
  ];

  return (
    <nav className={styles.bar} aria-label="Categorías de propiedades">
      <ul className={styles.list}>
        {tabs.map(({ slug, nombre, href, Icono, n }) => {
          const actual = slug === activa;
          return (
            <li key={href} className={styles.item} data-actual={actual || undefined}>
              <Link href={href} className={styles.tab} aria-current={actual ? 'page' : undefined}>
                <Icono size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>{nombre}</span>
                <span className={styles.count}>
                  {n}
                  <span className="sr-only"> {n === 1 ? 'propiedad' : 'propiedades'}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* RESUMEN
   Barra de pestañas de categorías (Server Component, sin JS): "Todas" + 9 categorías con ícono y
   cantidad publicada; la actual lleva aria-current="page". Recibe `activa` (slug) y `conteo`.
   Depende de: lib/queries/categories.js, lib/categories-meta.js, category-tabs.module.css */
