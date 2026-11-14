// src/lib/site-config.js

/**
 * Datos de contacto de RESPALDO. Los reales se editan en /dashboard/configuracion (tabla `configuracion`);
 * estos se usan solo si la base no responde o un campo está vacío, para que el sitio nunca quede sin
 * WhatsApp ni teléfono. Mismos campos que la tabla.
 */
export const CONTACTO_RESPALDO = {
  telefono: '+54 9 3456 55-3422',
  whatsapp: '+54 9 3456 55-3422',
  email: 'Inmobiliariapercara@hotmail.com',
  direccion: 'Salvarredy 1919',
  localidad: 'Chajarí',
  provincia: 'Entre Ríos',
  maps_url: null,
  instagram: 'percaranegociosinmobiliarios',
  facebook: 'inmobiliariapercara',
};

/* RESUMEN
   Datos de contacto de respaldo de la inmobiliaria (mismos campos que la tabla `configuracion`).
   Los usa lib/contacto.js cuando la base falla o falta un dato. Depende de: nada */
