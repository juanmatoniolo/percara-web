// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };

/* RESUMEN
   Stub inicial. Se implementa en su fase.
   Depende de: (pendiente) */
