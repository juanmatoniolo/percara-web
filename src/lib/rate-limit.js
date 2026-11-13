// src/lib/rate-limit.js
import 'server-only';
import { headers } from 'next/headers';

/* Memoria del proceso: alcanza para un solo servidor. En serverless con varias instancias cada una
   cuenta por separado; si hace falta un límite global, migrar a una tabla o a Upstash/Redis. */
const buckets = new Map();
const MAX_KEYS = 5000;

/** IP del cliente según los headers del proxy (Vercel / Cloudflare), o 'desconocida'. */
export async function ipCliente() {
  const h = await headers();
  return (
    h.get('cf-connecting-ip') || h.get('x-forwarded-for')?.split(',')[0].trim() || 'desconocida'
  );
}

/**
 * Ventana fija: permite `max` intentos cada `ventanaMs` por clave.
 * @param {string} clave  ej. `login:${ip}`
 * @param {{ max: number, ventanaMs: number }} opts
 * @returns {{ ok: boolean, reintentarEnSeg: number }}
 */
export function limitar(clave, { max, ventanaMs }) {
  const ahora = Date.now();
  const b = buckets.get(clave);

  if (!b || ahora > b.reinicio) {
    if (buckets.size >= MAX_KEYS) buckets.clear();
    buckets.set(clave, { cuenta: 1, reinicio: ahora + ventanaMs });
    return { ok: true, reintentarEnSeg: 0 };
  }

  b.cuenta += 1;
  if (b.cuenta > max) return { ok: false, reintentarEnSeg: Math.ceil((b.reinicio - ahora) / 1000) };
  return { ok: true, reintentarEnSeg: 0 };
}

/** Borra el contador de una clave (ej. tras un login correcto). */
export function reiniciar(clave) {
  buckets.delete(clave);
}

/* RESUMEN
   Rate limit en memoria con ventana fija: limitar(clave, {max, ventanaMs}), reiniciar(clave) e
   ipCliente() desde headers del proxy. Para login y formulario de contacto. Limitación: por instancia.
   Depende de: next/headers, server-only */
