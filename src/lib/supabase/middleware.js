// src/lib/supabase/middleware.js
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Renueva la sesión de Supabase en cada request protegida y redirige a /login si no hay usuario.
 * Solo es la primera barrera: cada layout, página y Server Action del panel vuelve a verificar.
 * @param {import('next/server').NextRequest} request
 */
export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(lista) {
          lista.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  /* getUser valida el token contra Supabase Auth (no confía solo en la cookie) */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}

/* RESUMEN
   Helper de middleware: crea un cliente Supabase sobre las cookies del request, renueva la sesión
   (copiando cookies a la respuesta) y redirige /dashboard/* a /login?next=... si no hay usuario.
   Exporta updateSession(request). Depende de: @supabase/ssr, next/server */
