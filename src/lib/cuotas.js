// src/lib/cuotas.js

/** Suma `n` meses a "YYYY-MM-DD" respetando fin de mes (31/01 + 1 = 28 o 29/02). */
function sumarMeses(iso, n) {
  const [a, m, d] = iso.split('-').map(Number);
  const ultimo = new Date(Date.UTC(a, m - 1 + n + 1, 0)).getUTCDate();
  const f = new Date(Date.UTC(a, m - 1 + n, Math.min(d, ultimo)));
  return f.toISOString().slice(0, 10);
}

/**
 * Próxima cuota mensual a vencer desde `hoy` (inclusive), o null si no hay cuotas o ya vencieron todas.
 * @param {{ primer_vencimiento: string | null, cantidad_cuotas: number | null }} r
 * @param {string} hoy  YYYY-MM-DD (zona Argentina)
 * @returns {{ numero: number, total: number, fecha: string, terminadas: boolean } | null}
 */
export function proximaCuota(r, hoy) {
  const total = r.cantidad_cuotas;
  if (!r.primer_vencimiento || !total) return null;
  for (let i = 0; i < total; i++) {
    const fecha = sumarMeses(r.primer_vencimiento, i);
    if (fecha >= hoy) return { numero: i + 1, total, fecha, terminadas: false };
  }
  return {
    numero: total,
    total,
    fecha: sumarMeses(r.primer_vencimiento, total - 1),
    terminadas: true,
  };
}

/**
 * Todas las cuotas mensuales con su fecha.
 * @param {{ primer_vencimiento: string | null, cantidad_cuotas: number | null }} r
 * @returns {{ numero: number, fecha: string }[]}
 */
export function calendarioCuotas(r) {
  if (!r.primer_vencimiento || !r.cantidad_cuotas) return [];
  return Array.from({ length: r.cantidad_cuotas }, (_, i) => ({
    numero: i + 1,
    fecha: sumarMeses(r.primer_vencimiento, i),
  }));
}

/* RESUMEN
   Cálculo de cuotas mensuales: proximaCuota(recordatorio, hoy) devuelve número, total y fecha de la próxima
   cuota a vencer (o la última con terminadas = true si ya pasaron todas); calendarioCuotas(recordatorio)
   lista todas con su fecha. Depende de: nada */
