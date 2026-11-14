// src/app/api/configuracion/route.js
import { getContacto } from '@/lib/queries/settings';

/* Datos públicos de contacto (los mismos que muestra el sitio). Cacheados con el tag 'propiedades'. */
export async function GET() {
  try {
    return Response.json({ ok: true, data: await getContacto() });
  } catch {
    return Response.json(
      { ok: false, error: 'No se pudo cargar la configuración.' },
      { status: 500 },
    );
  }
}

/* RESUMEN
   GET /api/configuracion: devuelve { ok, data } con los datos públicos de contacto de la inmobiliaria
   (teléfono, WhatsApp, email, dirección, Maps y redes). Depende de: lib/queries/settings.js */
