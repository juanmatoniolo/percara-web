// src/components/property/listing-view.jsx
import Breadcrumbs from '@/components/ui/breadcrumbs';
import CategoryTabs from './category-tabs';
import PropertyGrid from './property-grid';
import EmptyState from './empty-state';
import LocalidadFilter from './localidad-filter';
import Paginacion from './paginacion';
import { POR_PAGINA } from '@/lib/listado';
import { plural } from '@/lib/format';
import styles from './listing-view.module.css';

/**
 * Vista de listado: migas, encabezado con ícono, pestañas y grilla (o estado vacío).
 * @param {{
 *   titulo: string, bajada: string, Icono: import('react').ComponentType<any>,
 *   slug?: string, nombreCategoria?: string, migas: { nombre: string, path: string }[],
 *   resultado: { ok: true, data: import('@/types').Propiedad[], total: number } | { ok: false, error: string },
 *   conteo: Record<string, number>, base: string, localidades: { nombre: string, n: number }[],
 *   localidad?: string, pagina: number
 * }} props
 */
export default function ListingView({
  titulo,
  bajada,
  Icono,
  slug,
  nombreCategoria,
  migas,
  resultado,
  conteo,
  base,
  localidades,
  localidad,
  pagina,
}) {
  const propiedades = resultado.ok ? resultado.data : [];
  const total = resultado.ok ? resultado.total : 0;

  return (
    <>
      <header className={styles.head}>
        <div className={styles.inner}>
          <Breadcrumbs items={migas} />

          <div className={styles.titleRow}>
            <span className={styles.badge} aria-hidden="true">
              <Icono size={28} strokeWidth={1.5} />
            </span>
            <div>
              <h1 className={styles.title}>{titulo}</h1>
              <p className={styles.lead}>{bajada}</p>
            </div>
          </div>

          {total > 0 && (
            <p className={styles.total}>
              {plural(total, 'propiedad disponible', 'propiedades disponibles')}
              {localidad && ` en ${localidad}`}
            </p>
          )}
        </div>
      </header>

      <CategoryTabs activa={slug} conteo={conteo} />

      <section className={styles.results} aria-label="Resultados">
        <div className={styles.inner}>
          <LocalidadFilter base={base} localidades={localidades} actual={localidad} />
          {propiedades.length > 0 ? (
            <>
              <PropertyGrid propiedades={propiedades} prioridadPrimera nivel="h2" />
              <Paginacion
                base={base}
                pagina={pagina}
                totalPaginas={Math.ceil(total / POR_PAGINA)}
                localidad={localidad}
              />
            </>
          ) : (
            <EmptyState Icono={Icono} categoria={nombreCategoria} error={!resultado.ok} />
          )}
        </div>
      </section>
    </>
  );
}

/* RESUMEN
   Vista compartida de /propiedades y /categorias/[categoria] (Server Component): migas, encabezado con
   ícono, H1, bajada y total, pestañas de categorías, filtro de localidad, grilla paginada o estado
   vacío/error.
   Recibe `migas` (las mismas del JSON-LD). Depende de: components/ui/breadcrumbs.jsx, category-tabs.jsx,
   property-grid.jsx, empty-state.jsx, localidad-filter.jsx, paginacion.jsx, lib/{format,listado}.js, listing-view.module.css */
