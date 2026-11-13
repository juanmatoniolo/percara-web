// src/lib/site-config.js
export const CONTACT = {
  telefono: '+54 9 3456 55-3422',
  telefonoE164: '+5493456553422',
  whatsapp: '5493456553422',
  email: 'Inmobiliariapercara@hotmail.com',
  direccion: 'Salvarredy 1919, Chajarí, Entre Ríos',
  direccionCorta: 'Salvarredy 1919, Chajarí',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Salvarredy+1919%2C+Chajar%C3%AD%2C+Entre+R%C3%ADos',
  instagram: 'https://www.instagram.com/percaranegociosinmobiliarios',
  instagramUser: '@percaranegociosinmobiliarios',
  facebook: 'https://www.facebook.com/inmobiliariapercara',
  facebookUser: 'inmobiliariapercara',
};

export function whatsappUrl(text) {
  const base = `https://wa.me/${CONTACT.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/* RESUMEN
   Datos de contacto de la inmobiliaria (teléfono, WhatsApp, email, dirección, redes) y helper
   whatsappUrl(texto). Fuente temporal: se reemplazará por la tabla `configuracion` de Supabase.
   Depende de: nada */
