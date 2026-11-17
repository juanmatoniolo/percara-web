// src/lib/schemas/recordatorio.js
import { z } from 'zod';
import { enumOpcional, fechaOpcional, numeroOpcional, textoOpcional, uuidOpcional } from './campos';
import { ESTADOS_RECORDATORIO, FORMAS_PAGO, MEDIOS_PAGO, MONEDAS } from './recordatorio-etiquetas';

const claves = (o) => /** @type {[string, ...string[]]} */ (Object.keys(o));
const MONTO = { max: 1e13 };

export const recordatorioSchema = z.object({
  titulo: z.string().trim().min(2, 'Escriba un título.').max(160, 'Máximo 160 caracteres.'),
  fecha_operacion: fechaOpcional,
  cliente_id: uuidOpcional,
  propiedad_id: uuidOpcional,
  forma_pago: z.enum(claves(FORMAS_PAGO), { error: 'Elija la forma de pago.' }),
  medio_pago: enumOpcional(claves(MEDIOS_PAGO)),
  moneda: z.enum(claves(MONEDAS), { error: 'Elija la moneda.' }),
  monto_total: numeroOpcional('Monto inválido.', MONTO),
  anticipo: numeroOpcional('Monto inválido.', MONTO),
  cantidad_cuotas: numeroOpcional('Entre 1 y 600 cuotas.', { min: 1, max: 600, entero: true }),
  monto_cuota: numeroOpcional('Monto inválido.', MONTO),
  moneda_cuotas: enumOpcional(claves(MONEDAS)),
  primer_vencimiento: fechaOpcional,
  estado: z.enum(claves(ESTADOS_RECORDATORIO), { error: 'Estado inválido.' }),
  observaciones: textoOpcional(5000),
});

/* RESUMEN
   Schema Zod de Recordatorios: título, fecha, cliente y propiedad opcionales, forma/medio de pago, moneda,
   montos, cuotas (cantidad, monto, moneda, primer vencimiento), estado y observaciones libres.
   Depende de: zod, ./campos.js, ./recordatorio-etiquetas.js */
