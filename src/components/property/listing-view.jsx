// src/components/property/listing-view.jsx
import Breadcrumbs from '@/components/ui/breadcrumbs';
import CategoryTabs from './category-tabs';
import PropertyGrid from './property-grid';
import EmptyState from './empty-state';
import FiltrosListado from './filtros-listado';
import Paginacion from './paginacion';
import { POR_PAGINA, lugarElegido } from '@/lib/listado';
import { plural } from '@/lib/format';
import styles from './listing-view.module.css';

/**
 * Vista de listado: migas, encabezado con ícono, pestañas y grilla (o estado vacío).
 * @param {{
 *   titulo: string, bajada: string, Icono: import('react').ComponentType<any>,
 *   slug?: string, nombreCategoria?: string, migas: { nombre: string, path: string }[],
 *   resultado: { ok: true, data: import('@/types').Propiedad[], total: number } | { ok: false, error: string },
 *   conteo: Record<string, number>, base: string,
 *   arbol: import('@/lib/listado').ArbolLugares, filtros: import('@/lib/listado').Filtros
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
  arbol,
  filtros,
}) {
  const { pagina } = filtros;
  const lugar = lugarElegido(filtros);
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
              {lugar && ` en ${lugar}`}
            </p>
          )}
        </div>
      </header>

      <CategoryTabs activa={slug} conteo={conteo} />

      <section className={styles.results} aria-label="Resultados">
        <div className={styles.inner}>
          <FiltrosListado base={base} arbol={arbol} filtros={filtros} />
          {propiedades.length > 0 ? (
            <>
              <PropertyGrid propiedades={propiedades} prioridadPrimera nivel="h2" />
              <Paginacion
                base={base}
                pagina={pagina}
                totalPaginas={Math.ceil(total / POR_PAGINA)}
                filtros={filtros}
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
   ícono, H1, bajada y total, pestañas de categorías, filtros (provincia, ciudad, barrio y con precio), grilla paginada o estado
   vacío/error.
   Recibe `migas` (las mismas del JSON-LD). Depende de: components/ui/breadcrumbs.jsx, category-tabs.jsx,
   property-grid.jsx, empty-state.jsx, filtros-listado.jsx, paginacion.jsx, lib/{format,listado}.js, listing-view.module.css */
