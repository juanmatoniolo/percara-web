// src/lib/contact-data.js

/**
 * Datos de contacto de la inmobiliaria. Se mantienen hardcodeados hasta
 * conectar la tabla `configuracion`; los valores provienen del sitio actual.
 */
export const CONTACT = {
  telefonoRaw: '+5493456553422',
  whatsappRaw: '+5493456553422',
  email: 'Inmobiliariapercara@hotmail.com',
  direccion: 'Salvarredy 1919, Chajarí, Entre Ríos',
  mapsUrl: 'https://www.google.com/maps/place/Salvarredy+1919,+Chajar%C3%AD,+Entre+R%C3%ADos',
  redes: {
    instagram: 'https://www.instagram.com/percaranegociosinmobiliarios',
    facebook: 'https://www.facebook.com/inmobiliariapercara',
  },
};

/** Créditos de la agencia y el desarrollador (footer). */
export const CREDITOS = {
  agencia: {
    nombre: 'Revolucion Red',
    url: 'https://www.instagram.com/revolucionred/',
  },
  desarrollador: {
    nombre: 'Juanma Toniolo',
    url: 'https://wa.me/+5493412275598',
  },
};

/* RESUMEN
 * Constantes de contacto (teléfono, WhatsApp, email, dirección, redes) y
 * créditos del footer. Temporal hasta leer `configuracion` desde Supabase.
 * Lo importan header, footer, whatsapp-float y contact-block.
 */
