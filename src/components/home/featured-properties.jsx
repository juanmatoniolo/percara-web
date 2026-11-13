// src/components/home/featured-properties.jsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SectionTitle from '@/components/ui/section-title';
import PropertyGrid from '@/components/property/property-grid';
import { getPropiedades } from '@/lib/queries/properties';
import styles from './featured-properties.module.css';

/** Últimas propiedades publicadas (destacadas primero). No se muestra si no hay ninguna. */
export default async function FeaturedProperties() {
  const res = await getPropiedades({ limite: 6, destacadasPrimero: true });
  if (!res.ok || res.data.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="destacadas-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headText}>
            <SectionTitle id="destacadas-title">Propiedades destacadas</SectionTitle>
            <p className={`${styles.lead} reveal`}>
              Las últimas oportunidades en Chajarí y la zona.
            </p>
          </div>
          <Link href="/propiedades" className={`${styles.more} reveal`}>
            Ver todas
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <PropertyGrid propiedades={res.data} />
      </div>
    </section>
  );
}

/* RESUMEN
   Sección "Propiedades destacadas" de la home (Server Component async): hasta 6 publicadas, destacadas
   primero, en la grilla de cards con link a /propiedades. Devuelve null si no hay datos o falla la lectura.
   Depende de: components/ui/section-title.jsx, components/property/property-grid.jsx, queries, module.css */
