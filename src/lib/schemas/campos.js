// src/lib/schemas/campos.js
import { z } from 'zod';

export const vacioANull = (v) => (v === '' || v === null || v === undefined ? null : v);

/** Número opcional desde un input (vacío = null). */
export const numeroOpcional = (
  msg,
  { min = 0, max = Number.MAX_SAFE_INTEGER, entero = false } = {},
) =>
  z.preprocess(
    (v) => (vacioANull(v) === null ? null : Number(v)),
    (entero ? z.number({ error: msg }).int(msg) : z.number({ error: msg }))
      .min(min, msg)
      .max(max, msg)
      .nullable(),
  );

/** Texto opcional recortado (vacío = null). */
export const textoOpcional = (max, msg = `Máximo ${max} caracteres.`) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? vacioANull(v.trim()) : null),
    z.string().max(max, msg).nullable(),
  );

/** Opción de un select opcional (vacío = null). */
export const enumOpcional = (valores, msg = 'Opción inválida.') =>
  z.preprocess((v) => vacioANull(v), z.enum(valores, { error: msg }).nullable());

/** Fecha "YYYY-MM-DD" opcional. */
export const fechaOpcional = z.preprocess(
  (v) => vacioANull(v),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida.')
    .nullable(),
);

/** uuid opcional (vacío = null), para selects de cliente / propiedad. */
export const uuidOpcional = z.preprocess(
  (v) => vacioANull(v),
  z.string().uuid('Opción inválida.').nullable(),
);

export const checkbox = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean());

export const uuidSchema = z.string().uuid();

/**
 * FormData -> objeto plano con solo las claves del schema (lo que falta queda en null).
 * @param {z.ZodObject<any>} schema
 * @param {FormData} formData
 */
export function leerForm(schema, formData) {
  return Object.fromEntries(Object.keys(schema.shape).map((k) => [k, formData.get(k)]));
}

/* RESUMEN
   Piezas Zod reutilizables para formularios del panel: textos, números, selects, fechas y uuid
   opcionales (vacío = null), checkbox, uuidSchema y leerForm(schema, formData).
   Lo usan lib/schemas/{propiedad,cliente,pedido}.js. Depende de: zod */
