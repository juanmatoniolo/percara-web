// src/lib/schemas/pedido.js
import { z } from 'zod';
import { fechaOpcional, numeroOpcional, textoOpcional, uuidOpcional, vacioANull } from './campos';
import { ESTADOS_PEDIDO, PRIORIDADES } from './agenda-etiquetas';

const claves = (o) => /** @type {[string, ...string[]]} */ (Object.keys(o));

export const pedidoSchema = z.object({
  titulo: z.string().trim().min(2, 'Escriba un título.').max(160, 'Máximo 160 caracteres.'),
  detalle: textoOpcional(3000),
  fecha: fechaOpcional,
  hora: z.preprocess(
    (v) => vacioANull(v),
    z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Hora inválida.')
      .nullable(),
  ),
  prioridad: z.enum(claves(PRIORIDADES), { error: 'Elija la prioridad.' }),
  estado: z.enum(claves(ESTADOS_PEDIDO), { error: 'Estado inválido.' }),
  cliente_id: uuidOpcional,
  propiedad_id: uuidOpcional,
  /* Qué busca el cliente (opcional) */
  categoria_id: z.preprocess(
    (v) => (vacioANull(v) === null ? null : Number(v)),
    z.number({ error: 'Tipo inválido.' }).int().positive().nullable(),
  ),
  presupuesto: numeroOpcional('Presupuesto inválido.', { max: 1e12 }),
  moneda: z.enum(['USD', 'ARS'], { error: 'Elija la moneda.' }),
});

export const estadoPedidoSchema = pedidoSchema.shape.estado;

/** Ruta de regreso segura (solo dentro del panel), para volver a la lista, al calendario o al cliente. */
export const volverSchema = z
  .string()
  .regex(/^\/dashboard(\/[\w\-/]*)?(\?[\w\-=&%.]*)?$/)
  .catch('/dashboard/pedidos');

/* RESUMEN
   Schemas Zod de la Carpeta de pedidos: pedidoSchema (título, detalle, fecha, hora, prioridad, estado,
   cliente/propiedad opcionales y qué busca: tipo, presupuesto y moneda), estadoPedidoSchema y volverSchema (redirección solo a /dashboard...).
   Depende de: zod, ./campos.js, ./agenda-etiquetas.js */
