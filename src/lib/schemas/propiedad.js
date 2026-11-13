// src/lib/schemas/propiedad.js
import { z } from 'zod';

const vacioANull = (v) => (v === '' || v === null || v === undefined ? null : v);

/** Número opcional desde un input (vacío = null). */
const numeroOpcional = (msg, { min = 0, max = Number.MAX_SAFE_INTEGER, entero = false } = {}) =>
  z.preprocess(
    (v) => (vacioANull(v) === null ? null : Number(v)),
    (entero ? z.number({ error: msg }).int(msg) : z.number({ error: msg }))
      .min(min, msg)
      .max(max, msg)
      .nullable(),
  );

const textoOpcional = (max) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? vacioANull(v.trim()) : null),
    z.string().max(max).nullable(),
  );

const checkbox = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean());

/* Acepta lo que copia Google Maps: "-30.7624, -57.9808", "(-30.76,-57.98)" o un link con "@-30.76,-57.98" */
const COORDS = /(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/;
const MSG_COORDS = 'Pegue las coordenadas de Google Maps, ej.: -30.7624, -57.9808';

const coordenadas = z.preprocess(
  (v) => (typeof v === 'string' ? vacioANull(v.trim()) : null),
  z
    .string()
    .max(400)
    .nullable()
    .transform((v, ctx) => {
      if (v === null) return { lat: null, lng: null };
      const m = v.match(COORDS);
      const lat = m ? Number(m[1]) : NaN;
      const lng = m ? Number(m[2]) : NaN;
      if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) {
        ctx.addIssue({ code: 'custom', message: MSG_COORDS });
        return z.NEVER;
      }
      return { lat, lng };
    }),
);

export const propiedadSchema = z.object({
  titulo: z.string().trim().min(5, 'Mínimo 5 caracteres.').max(140, 'Máximo 140 caracteres.'),
  descripcion: textoOpcional(5000),
  precio: numeroOpcional('Precio inválido.', { max: 1e13 }),
  mostrar_precio: checkbox,
  moneda: z.enum(['USD', 'ARS'], { error: 'Elija la moneda.' }),
  categoria_id: z.coerce
    .number({ error: 'Elija una categoría.' })
    .int()
    .positive('Elija una categoría.'),
  localidad: textoOpcional(80),
  direccion: textoOpcional(160),
  coordenadas,
  superficie_total: numeroOpcional('Superficie inválida.', { max: 1e9 }),
  superficie_cubierta: numeroOpcional('Superficie inválida.', { max: 1e7 }),
  ambientes: numeroOpcional('Número inválido.', { max: 99, entero: true }),
  dormitorios: numeroOpcional('Número inválido.', { max: 99, entero: true }),
  banos: numeroOpcional('Número inválido.', { max: 99, entero: true }),
  cochera: checkbox,
  destacada: checkbox,
  estado: z.enum(['borrador', 'publicada', 'vendida'], { error: 'Estado inválido.' }),
});

export const uuidSchema = z.string().uuid();
export const estadoSchema = propiedadSchema.shape.estado;

/**
 * FormData -> objeto plano con solo las claves del schema (los checkboxes ausentes quedan en null).
 * @param {FormData} formData
 */
export function desdeFormData(formData) {
  return Object.fromEntries(Object.keys(propiedadSchema.shape).map((k) => [k, formData.get(k)]));
}

/**
 * Datos validados -> fila de `propiedades`. La operación es siempre venta (el cliente no alquila).
 * @param {z.infer<typeof propiedadSchema>} data
 */
export function aFila({ coordenadas: c, ...data }) {
  return { ...data, lat: c.lat, lng: c.lng, operacion: 'venta' };
}

/* RESUMEN
   Schema Zod de alta/edición de propiedad: textos recortados, números opcionales, precio con
   mostrar_precio, coordenadas en un solo campo (formato de Google Maps -> lat/lng) y checkboxes.
   Exporta propiedadSchema, uuidSchema, estadoSchema, desdeFormData y aFila. Depende de: zod */
