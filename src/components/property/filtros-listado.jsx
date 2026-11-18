// src/components/property/filtros-listado.jsx
'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { SIN_BARRIO, conProvincias, hayFiltros, urlListado } from '@/lib/listado';
import styles from './filtros-listado.module.css';

/** Select de un nivel: "Todas…" + opciones con cantidad. */
function Nivel({ name, label, todas, opciones, valor, onElegir, Icono }) {
  return (
    <label className={styles.campo}>
      <span className={styles.label}>
        {Icono && <Icono size={16} aria-hidden="true" />} {label}
      </span>
      <select
        name={name}
        value={valor ?? ''}
        onChange={(e) => onElegir(e.target.value || undefined)}
        className={styles.control}
      >
        <option value="">{todas}</option>
        {opciones.map(({ valor: v, texto, n }) => (
          <option key={v} value={v}>
            {texto} ({n})
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Filtros del listado (Client Component): provincia > ciudad > barrio en cascada, cada nivel aparece al
 * elegir el anterior y solo ofrece lo que existe en la base; más "solo con precio publicado". Cada
 * cambio actualiza la URL (compartible, sin recargar el scroll). Sin JS funciona como formulario GET.
 * @param {{ base: string, arbol: import('@/lib/listado').ArbolLugares, filtros: import('@/lib/listado').Filtros }} props
 */
export default function FiltrosListado({ base, arbol, filtros: f }) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const ir = (nuevos) =>
    startTransition(() =>
      router.push(urlListado(base, { ...nuevos, pagina: 1 }), { scroll: false }),
    );

  const hayProv = conProvincias(arbol);
  const prov = arbol.find((p) => p.nombre === f.provincia);
  const locs = prov ? prov.localidades : hayProv ? null : arbol.flatMap((p) => p.localidades);
  const loc = locs?.find((l) => l.nombre === f.localidad);
  const barrios = loc
    ? [
        ...loc.barrios.map((b) => ({ valor: b.nombre, texto: b.nombre, n: b.n })),
        ...(loc.sinBarrio
          ? [{ valor: SIN_BARRIO, texto: 'Sin barrio asignado', n: loc.sinBarrio }]
          : []),
      ]
    : [];

  return (
    <form
      method="get"
      action={base}
      className={styles.form}
      role="search"
      aria-label="Filtrar propiedades"
      aria-busy={pendiente}
    >
      <p className={styles.titulo}>
        {pendiente ? (
          <LoaderCircle className={styles.spin} size={18} aria-hidden="true" />
        ) : (
          <SlidersHorizontal size={18} strokeWidth={1.75} aria-hidden="true" />
        )}
        Filtrar
      </p>

      {hayProv && (
        <Nivel
          name="provincia"
          label="Provincia"
          todas="Todas las provincias"
          Icono={MapPin}
          opciones={arbol
            .filter((p) => p.nombre)
            .map((p) => ({ valor: p.nombre, texto: p.nombre, n: p.n }))}
          valor={f.provincia}
          onElegir={(provincia) => ir({ provincia, conPrecio: f.conPrecio })}
        />
      )}

      {locs && (
        <Nivel
          name="localidad"
          label="Ciudad"
          todas="Todas las ciudades"
          Icono={hayProv ? null : MapPin}
          opciones={locs.map((l) => ({ valor: l.nombre, texto: l.nombre, n: l.n }))}
          valor={f.localidad}
          onElegir={(localidad) =>
            ir({ provincia: f.provincia, localidad, conPrecio: f.conPrecio })
          }
        />
      )}

      {loc && barrios.length > 0 && (
        <Nivel
          name="barrio"
          label="Barrio"
          todas="Todos los barrios"
          opciones={barrios}
          valor={f.barrio}
          onElegir={(barrio) => ir({ ...f, barrio })}
        />
      )}

      <label className={styles.check}>
        <input
          type="checkbox"
          name="conprecio"
          value="1"
          checked={f.conPrecio}
          onChange={(e) => ir({ ...f, conPrecio: e.target.checked })}
        />
        Solo con precio publicado
      </label>

      <div className={styles.acciones}>
        <noscript>
          <button type="submit" className={styles.submit}>
            Filtrar
          </button>
        </noscript>
        {hayFiltros(f) && (
          <Link href={base} scroll={false} className={styles.clear}>
            <X size={16} aria-hidden="true" />
            Limpiar
          </Link>
        )}
      </div>
    </form>
  );
}

/* RESUMEN
   Filtros del listado público (Client Component): provincia, ciudad y barrio en cascada (cada uno aparece
   al elegir el anterior, solo con valores existentes y su cantidad; "Sin barrio asignado" si corresponde)
   y "solo con precio publicado". Navega al cambiar; sin JS es un GET con botón. Recibe base, arbol y filtros.
   Depende de: lib/listado.js, filtros-listado.module.css */
