// src/lib/schemas/recordatorio-etiquetas.js

/* Opciones visibles de Recordatorios. Sin Zod: lo importan también Client Components. */

export const FORMAS_PAGO = {
  contado: 'Contado',
  financiado: 'Financiado (banco o crédito)',
  cuotas: 'Cuotas con el vendedor',
  permuta: 'Permuta',
  mixto: 'Mixto',
};

export const MEDIOS_PAGO = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  mixto: 'Mixto',
  otro: 'Otro',
};

export const MONEDAS = { USD: 'USD (dólares)', ARS: 'ARS (pesos)' };

export const ESTADOS_RECORDATORIO = {
  en_curso: 'En curso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

/** Formas de pago que llevan cuotas (muestran el bloque de cuotas y el próximo vencimiento). */
export const CON_CUOTAS = new Set(['financiado', 'cuotas', 'mixto']);

/** Nombres de los campos (para el aviso general de errores del formulario). */
export const ETIQUETAS_RECORDATORIO = {
  titulo: 'Título',
  fecha_operacion: 'Fecha del negocio',
  cliente_id: 'Cliente',
  propiedad_id: 'Propiedad',
  forma_pago: 'Forma de pago',
  medio_pago: 'Medio de pago',
  moneda: 'Moneda',
  monto_total: 'Monto total',
  anticipo: 'Anticipo',
  cantidad_cuotas: 'Cantidad de cuotas',
  monto_cuota: 'Monto de cada cuota',
  moneda_cuotas: 'Moneda de las cuotas',
  primer_vencimiento: 'Primer vencimiento',
  estado: 'Estado',
  observaciones: 'Observaciones',
};

/* RESUMEN
   Etiquetas y opciones de Recordatorios: formas y medios de pago, monedas, estados, qué formas llevan
   cuotas y nombres de campos para avisos de error. Separado del schema para no mandar Zod al navegador.
   Depende de: nada */
