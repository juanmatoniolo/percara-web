// src/lib/fechas.js

/* El servidor (Vercel) corre en UTC: "hoy" se calcula siempre con la hora de Argentina */
const ZONA = 'America/Argentina/Buenos_Aires';

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
export const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** Fecha de hoy en Argentina como "YYYY-MM-DD". */
export function hoyAR() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date());
}

/** "YYYY-MM-DD" -> { y, m, d } (m de 1 a 12). */
function partes(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

/** "2026-11-14" -> "sábado 14 de noviembre". Sin zonas horarias: la fecha es "de calendario". */
export function fechaLarga(iso) {
  if (!iso) return '';
  const { y, m, d } = partes(iso);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DIAS[dow]} ${d} de ${MESES[m - 1]}`;
}

/** "14:30:00" -> "14:30". */
export function horaCorta(hora) {
  return hora ? hora.slice(0, 5) : '';
}

/** Mes válido "YYYY-MM" o el mes actual en Argentina. */
export function mesSeguro(mes) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(mes ?? '') ? mes : hoyAR().slice(0, 7);
}

/** "2026-11" -> "Noviembre 2026". */
export function nombreMes(mes) {
  const [y, m] = mes.split('-').map(Number);
  const n = MESES[m - 1];
  return `${n[0].toUpperCase()}${n.slice(1)} ${y}`;
}

/** Suma meses a "YYYY-MM". */
export function moverMes(mes, delta) {
  const [y, m] = mes.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Celdas de la grilla del mes (semanas de lunes a domingo). Los días de relleno son null.
 * @param {string} mes "YYYY-MM"
 * @returns {{ desde: string, hasta: string, celdas: (string | null)[] }}
 */
export function grillaMes(mes) {
  const [y, m] = mes.split('-').map(Number);
  const dias = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // lunes = 0
  const celdas = Array(offset).fill(null);
  for (let d = 1; d <= dias; d += 1) celdas.push(`${mes}-${String(d).padStart(2, '0')}`);
  while (celdas.length % 7) celdas.push(null);
  return { desde: `${mes}-01`, hasta: `${mes}-${String(dias).padStart(2, '0')}`, celdas };
}

/* RESUMEN
   Fechas de agenda sin dependencias: hoyAR() (zona Argentina), fechaLarga("YYYY-MM-DD"), horaCorta(),
   mesSeguro(), nombreMes(), moverMes() y grillaMes(mes) para el calendario (lunes a domingo).
   Las fechas se tratan como "de calendario" (sin hora), así no se corren por la zona. Depende de: nada */
