// src/lib/listado.js

/** Propiedades por página en /propiedades y /categorias/[categoria]. */
export const POR_PAGINA = 24;

/**
 * Lee ?localidad= y ?pagina= del listado. La localidad solo vale si está entre las publicadas
 * (lista blanca); la página es un entero >= 1 (si no, 1).
 * @param {Record<string, string | string[] | undefined>} sp  searchParams ya resueltos
 * @param {{ nombre: string }[]} localidades
 * @returns {{ localidad: string | undefined, pagina: number }}
 */
export function leerFiltros(sp, localidades) {
  const pedida = typeof sp.localidad === 'string' ? sp.localidad.trim() : '';
  const localidad = localidades.find((l) => l.nombre === pedida)?.nombre;
  const n = Number(sp.pagina);
  const pagina = Number.isInteger(n) && n >= 1 && n <= 1000 ? n : 1;
  return { localidad, pagina };
}

/**
 * URL del listado conservando el filtro (sin parámetros vacíos ni ?pagina=1).
 * @param {string} base  ej. "/propiedades" @param {{ localidad?: string, pagina?: number }} q
 */
export function urlListado(base, { localidad, pagina } = {}) {
  const params = new URLSearchParams();
  if (localidad) params.set('localidad', localidad);
  if (pagina && pagina > 1) params.set('pagina', String(pagina));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/* RESUMEN
   Utilidades del listado público: POR_PAGINA, leerFiltros(searchParams, localidades) valida ?localidad=
   contra las publicadas y ?pagina=, y urlListado(base, filtros) arma links limpios.
   Lo usan las páginas de listado y components/property/{localidad-filter,paginacion}.jsx. Depende de: nada */
