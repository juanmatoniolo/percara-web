// src/lib/lugares.js

/** Provincias de Argentina (lista cerrada: se elige, no se escribe). */
export const PROVINCIAS = [
  'Entre Ríos',
  'Corrientes',
  'Buenos Aires',
  'Ciudad Autónoma de Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

/** Espacios de más fuera: "  Barrio   Las 14 " -> "Barrio Las 14". */
export const limpiar = (texto) =>
  String(texto ?? '')
    .trim()
    .replace(/\s+/g, ' ');

/** Clave para comparar sin tildes, mayúsculas ni espacios de más: "CHAJARI " === "Chajarí". */
export const clave = (texto) => limpiar(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Si el texto ya existe escrito de otra forma (tildes, mayúsculas, espacios), devuelve la forma ya
 * cargada; si es nuevo, lo devuelve limpio. Así nunca conviven "Chajari" y "Chajarí".
 * @param {string | null} valor @param {string[]} existentes
 * @returns {string | null}
 */
export function canonico(valor, existentes) {
  const limpio = limpiar(valor);
  if (!limpio) return null;
  const k = clave(limpio);
  return existentes.find((e) => clave(e) === k) ?? limpio;
}

/* RESUMEN
   Lugares (provincia, localidad, barrio): lista cerrada de PROVINCIAS, limpiar(), clave() para comparar
   sin tildes ni mayúsculas y canonico(valor, existentes) que reutiliza la forma ya cargada.
   Lo usan actions/properties.js, el formulario del panel y los filtros. Depende de: nada */
