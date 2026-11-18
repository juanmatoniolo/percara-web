// src/components/ui/whatsapp-float.jsx
import WhatsAppFloatCerrable from './whatsapp-float-cerrable';
import { whatsappUrl } from '@/lib/contacto';
import { getContacto } from '@/lib/queries/settings';

const MENSAJE = 'Hola, quisiera consultar por una propiedad.';

export default async function WhatsAppFloat() {
  const contacto = await getContacto();
  return <WhatsAppFloatCerrable href={whatsappUrl(contacto, MENSAJE)} />;
}

/* RESUMEN
   Botón flotante de WhatsApp (Server Component): arma el link con el teléfono de la configuración y el
   mensaje prellenado y lo pasa a la versión cerrable (cliente). Circular en móvil; con texto desde 768px.
   Depende de: whatsapp-float-cerrable.jsx, lib/contacto.js, lib/queries/settings.js */
