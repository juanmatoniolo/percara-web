// src/components/home/category-grid.jsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SectionTitle from '@/components/ui/section-title';
import { CATEGORIAS } from '@/lib/queries/categories';
import { iconoCategoria } from '@/lib/categories-meta';
import { getConteoPorCategoria } from '@/lib/queries/properties';
import { plural } from '@/lib/format';
import styles from './category-grid.module.css';

export default async function CategoryGrid() {
  const conteo = await getConteoPorCategoria();

  return (
    <section id="categorias" className={styles.section} aria-labelledby="categorias-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <SectionTitle id="categorias-title">Inmuebles en venta</SectionTitle>
          <p className={`${styles.lead} reveal`} style={{ '--i': 1 }}>
            Elija una categoría y vea las propiedades disponibles.
          </p>
        </header>

        <ul className={styles.grid}>
          {CATEGORIAS.map((cat, i) => {
            const Icon = iconoCategoria(cat.slug);
            const n = conteo[cat.slug] ?? 0;
            return (
              <li key={cat.slug} className="reveal" style={{ '--i': i % 3 }}>
                <Link href={`/categorias/${cat.slug}`} className={styles.card}>
                  <span className={styles.icon} aria-hidden="true">
                    <Icon size={26} strokeWidth={1.6} />
                  </span>
                  <span className={styles.text}>
                    <span className={styles.name}>{cat.nombre}</span>
                    <span className={styles.count}>
                      {n > 0 ? plural(n, 'disponible', 'disponibles') : 'Próximamente'}
                    </span>
                  </span>
                  <ArrowRight className={styles.arrow} size={20} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href="/propiedades" className={`${styles.all} reveal`}>
          Ver todas las propiedades
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

/* RESUMEN
   Sección de categorías (Server Component async): 9 tarjetas con ícono en placa verde, nombre, cantidad
   publicada (o "Próximamente") y flecha, enlazadas a /categorias/{slug}; botón a /propiedades.
   Depende de: components/ui/section-title.jsx, lib/{categories-meta,format}.js, queries, module.css */
