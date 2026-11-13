// src/middleware.js
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request) {
  return updateSession(request);
}

/* Solo el panel: el sitio público no paga el costo de verificar sesión */
export const config = { matcher: ['/dashboard/:path*'] };

/* RESUMEN
   Middleware de Next: en /dashboard/* renueva la sesión de Supabase y redirige a /login si no hay
   usuario. No toca rutas públicas ni /login (que queda oculto, sin links desde el sitio).
   Depende de: lib/supabase/middleware.js */
