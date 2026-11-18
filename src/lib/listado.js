// src/lib/listado.js

/** Propiedades por página en /propiedades y /categorias/[categoria]. */
export const POR_PAGINA = 24;

/** Valor de ?barrio= para las propiedades sin barrio asignado. */
export const SIN_BARRIO = 'sin-asignar';

/**
 * @typedef {{ nombre: string, n: number, sinBarrio: number, barrios: { nombre: string, n: number }[] }} LocalidadArbol
 * @typedef {{ nombre: string | null, n: number, localidades: LocalidadArbol[] }} ProvinciaArbol
 * @typedef {ProvinciaArbol[]} ArbolLugares
 * @typedef {{ provincia?: string, localidad?: string, barrio?: string, conPrecio: boolean, pagina: number }} Filtros
 */

const texto = (v) => (typeof v === 'string' ? v.trim() : '');

/** ¿El árbol tiene provincias cargadas? (sin la migración 009 hay una sola rama con nombre null) */
export const conProvincias = (arbol) => arbol.some((p) => p.nombre);

/**
 * Filtros desde la URL validados en cascada contra el árbol de lugares (lista blanca): la provincia
 * debe existir; la localidad, dentro de esa provincia; el barrio, dentro de esa localidad (o SIN_BARRIO
 * si hay alguna sin barrio). Más ?conprecio=1 y ?pagina=.
 * @param {Record<string, string | string[] | undefined>} sp  searchParams ya resueltos
 * @param {ArbolLugares} arbol
 * @returns {Filtros}
 */
export function leerFiltros(sp, arbol) {
  const n = Number(sp.pagina);
  const f = {
    conPrecio: sp.conprecio === '1',
    pagina: Number.isInteger(n) && n >= 1 && n <= 1000 ? n : 1,
  };
  /* Sin provincias en la base se elige la ciudad entre todas */
  const prov = conProvincias(arbol) ? arbol.find((p) => p.nombre === texto(sp.provincia)) : null;
  if (prov) f.provincia = prov.nombre;
  const locs = prov
    ? prov.localidades
    : conProvincias(arbol)
      ? []
      : arbol.flatMap((p) => p.localidades);
  const loc = locs.find((l) => l.nombre === texto(sp.localidad));
  if (!loc) return f;
  f.localidad = loc.nombre;
  const b = texto(sp.barrio);
  if (b === SIN_BARRIO && loc.sinBarrio > 0) f.barrio = SIN_BARRIO;
  else if (loc.barrios.some((x) => x.nombre === b)) f.barrio = b;
  return f;
}

/** ¿Hay algún filtro activo (además de la página)? */
export const hayFiltros = (f) => Boolean(f.provincia || f.localidad || f.barrio || f.conPrecio);

/**
 * URL del listado conservando los filtros (sin parámetros vacíos ni ?pagina=1).
 * @param {string} base  ej. "/propiedades" @param {Partial<Filtros>} f
 */
export function urlListado(base, f = {}) {
  const params = new URLSearchParams();
  if (f.provincia) params.set('provincia', f.provincia);
  if (f.localidad) params.set('localidad', f.localidad);
  if (f.localidad && f.barrio) params.set('barrio', f.barrio);
  if (f.conPrecio) params.set('conprecio', '1');
  if (f.pagina && f.pagina > 1) params.set('pagina', String(f.pagina));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Texto del lugar elegido para el total: "Las 14, Chajarí" / "Chajarí" / "Entre Ríos". */
export function lugarElegido(f) {
  if (f.localidad)
    return f.barrio && f.barrio !== SIN_BARRIO ? `${f.barrio}, ${f.localidad}` : f.localidad;
  return f.provincia;
}

/* RESUMEN
   Utilidades del listado público: POR_PAGINA, SIN_BARRIO, typedefs del árbol de lugares, leerFiltros
   (provincia > localidad > barrio en cascada contra el árbol, ?conprecio y ?pagina), hayFiltros,
   urlListado(base, filtros) y lugarElegido. Lo usan las páginas de listado, filtros-listado y paginacion.
   Depende de: nada */
