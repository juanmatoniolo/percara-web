// src/lib/contacto.js
import { CONTACTO_RESPALDO } from '@/lib/site-config';
import { linkWhatsApp, normalizarTelefono } from '@/lib/telefono';

/**
 * @typedef {Object} Contacto
 * @property {string} telefono        Como se muestra ("+54 9 3456 55-3422").
 * @property {string} telefonoHref    "tel:+549..." para los botones de llamar.
 * @property {string} whatsapp        Dígitos para wa.me (549...).
 * @property {string} email
 * @property {string} direccion       Calle y número.
 * @property {string} localidad
 * @property {string} provincia
 * @property {string} direccionCorta  "Salvarredy 1919, Chajarí".
 * @property {string} mapsUrl
 * @property {string | null} instagram  URL del perfil.
 * @property {string | null} facebook   URL de la página.
 */

const vacio = (v) => v === null || v === undefined || String(v).trim() === '';

/** Usuario de una red a partir de "@usuario", "usuario" o la URL del perfil. */
export function usuarioRed(valor) {
  if (vacio(valor)) return null;
  const limpio = String(valor)
    .trim()
    .replace(/^https?:\/\/(www\.|m\.)?(instagram|facebook)\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0];
  return limpio || null;
}

/**
 * Fila de `configuracion` (o null) -> datos listos para los botones del sitio. Cada campo vacío se
 * completa con el respaldo de lib/site-config.js.
 * @param {Record<string, any> | null} fila
 * @returns {Contacto}
 */
export function armarContacto(fila) {
  const d = { ...CONTACTO_RESPALDO };
  for (const k of Object.keys(d)) if (fila && !vacio(fila[k])) d[k] = String(fila[k]).trim();

  const whatsapp = normalizarTelefono(d.whatsapp) ?? normalizarTelefono(CONTACTO_RESPALDO.whatsapp);
  const tel = normalizarTelefono(d.telefono);
  const direccionCompleta = [d.direccion, d.localidad, d.provincia].filter(Boolean).join(', ');
  const ig = usuarioRed(d.instagram);
  const fb = usuarioRed(d.facebook);

  return {
    telefono: d.telefono,
    telefonoHref: tel ? `tel:+${tel}` : `tel:${d.telefono.replace(/[^\d+]/g, '')}`,
    whatsapp,
    email: d.email,
    direccion: d.direccion,
    localidad: d.localidad,
    provincia: d.provincia,
    direccionCorta: [d.direccion, d.localidad].filter(Boolean).join(', '),
    mapsUrl:
      d.maps_url ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`,
    instagram: ig ? `https://www.instagram.com/${ig}` : null,
    facebook: fb ? `https://www.facebook.com/${fb}` : null,
  };
}

/**
 * Link de WhatsApp de la inmobiliaria con mensaje prellenado.
 * @param {Contacto} contacto
 * @param {string} [mensaje]
 */
export function whatsappUrl(contacto, mensaje) {
  return linkWhatsApp(contacto.whatsapp, mensaje) ?? `https://wa.me/${contacto.whatsapp}`;
}

/* RESUMEN
   Arma los datos de contacto del sitio a partir de la fila de `configuracion`: completa con el respaldo,
   normaliza WhatsApp y teléfono, arma dirección, link de Maps y URLs de redes. Exporta armarContacto,
   whatsappUrl(contacto, mensaje) y usuarioRed. Depende de: lib/site-config.js, lib/telefono.js */
