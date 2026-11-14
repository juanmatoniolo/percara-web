// src/lib/telefono.js

/* Característica de Chajarí: se usa cuando el número se cargó sin código de área (ej. "15 553422"). */
const AREA_LOCAL = '3456';

/**
 * Normaliza un teléfono argentino cargado "como venga" al formato internacional de celular que pide
 * WhatsApp: 549 + área + número (13 dígitos). Acepta "+54 9 3456 55-3422", "03456 15553422",
 * "3456553422", "15 553422" o "553422". Un número extranjero con "+" se devuelve tal cual (solo dígitos).
 * @param {string | null | undefined} telefono
 * @returns {string | null} dígitos sin "+" o null si no se puede interpretar
 */
export function normalizarTelefono(telefono) {
  if (!telefono) return null;
  const crudo = String(telefono).trim();
  let d = crudo.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);

  const internacional = crudo.startsWith('+') || crudo.startsWith('00');
  if (internacional && !d.startsWith('54')) return d.length >= 8 && d.length <= 15 ? d : null;

  if (d.startsWith('54')) {
    d = d.slice(2);
    if (d.startsWith('9')) d = d.slice(1);
  }
  if (d.startsWith('0')) d = d.slice(1);

  /* Quita el "15" de celular que va después del código de área (de 4, 3 o 2 dígitos) */
  if (d.length === 12) {
    for (const largo of [4, 3, 2]) {
      if (d.slice(largo, largo + 2) === '15') {
        d = d.slice(0, largo) + d.slice(largo + 2);
        break;
      }
    }
  }
  /* Número local sin característica */
  if (d.length === 8 && d.startsWith('15')) d = AREA_LOCAL + d.slice(2);
  else if (d.length === 6) d = AREA_LOCAL + d;

  return d.length === 10 ? `549${d}` : null;
}

/**
 * Link de WhatsApp con mensaje prellenado, o null si el teléfono no sirve.
 * @param {string | null | undefined} telefono
 * @param {string} [mensaje]
 */
export function linkWhatsApp(telefono, mensaje) {
  const n = normalizarTelefono(telefono);
  if (!n) return null;
  return mensaje ? `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}` : `https://wa.me/${n}`;
}

/**
 * Link para llamar. Usa el formato internacional si se pudo normalizar; si no, los dígitos cargados.
 * @param {string | null | undefined} telefono
 */
export function linkLlamar(telefono) {
  if (!telefono) return null;
  const n = normalizarTelefono(telefono);
  if (n) return `tel:+${n}`;
  const d = String(telefono).replace(/[^\d+]/g, '');
  return d.length >= 6 ? `tel:${d}` : null;
}

/* RESUMEN
   Helpers de teléfono (sin dependencias, sirven en servidor y navegador): normalizarTelefono() lleva un
   número argentino escrito de cualquier forma a 549+área+número; linkWhatsApp(tel, mensaje) y
   linkLlamar(tel) arman los href (null si el número no sirve). Depende de: nada */
