// src/lib/schemas/agenda-etiquetas.js

/* Opciones visibles de clientes y pedidos. Sin Zod: lo importan también Client Components. */

export const ROLES = { comprador: 'Comprador', propietario: 'Dueño' };

export const ESTADOS_INTERES = {
  interesado: 'Interesado',
  visita_agendada: 'Visita agendada',
  visito: 'Visitó',
  oferto: 'Ofertó',
  descartada: 'Descartada',
};

export const ESTADOS_CIVILES = {
  soltero: 'Soltero/a',
  casado: 'Casado/a',
  divorciado: 'Divorciado/a',
  viudo: 'Viudo/a',
  union_convivencial: 'Unión convivencial',
};

export const ORIGENES = {
  whatsapp: 'WhatsApp',
  telefono: 'Llamada',
  oficina: 'Vino a la oficina',
  redes: 'Redes sociales',
  web: 'Sitio web',
  recomendacion: 'Recomendación',
  cartel: 'Cartel',
  otro: 'Otro',
};

export const PRIORIDADES = { alta: 'Alta', normal: 'Normal', baja: 'Baja' };

/** Cookie donde se recuerda la vista elegida de la Carpeta de pedidos (lista | calendario). */
export const COOKIE_VISTA_PEDIDOS = 'pedidos_vista';

export const ESTADOS_PEDIDO = { pendiente: 'Pendiente', hecho: 'Hecho', cancelado: 'Cancelado' };

/** Nombres de los campos (para el aviso general de errores de los formularios). */
export const ETIQUETAS_AGENDA = {
  nombre: 'Nombre',
  telefono: 'Teléfono',
  telefono_alt: 'Otro teléfono',
  email: 'Email',
  localidad: 'Localidad',
  busca: 'Qué busca',
  presupuesto: 'Presupuesto',
  moneda: 'Moneda',
  categoria_id: 'Categoría',
  notas: 'Notas',
  dni_cuit: 'DNI / CUIT',
  fecha_nacimiento: 'Fecha de nacimiento',
  nacionalidad: 'Nacionalidad',
  estado_civil: 'Estado civil',
  conyuge: 'Cónyuge',
  profesion: 'Profesión',
  domicilio: 'Domicilio',
  origen: 'Cómo nos conoció',
  titulo: 'Título',
  detalle: 'Detalle',
  fecha: 'Fecha',
  hora: 'Hora',
  prioridad: 'Prioridad',
  estado: 'Estado',
  cliente_id: 'Cliente',
  propiedad_id: 'Propiedad',
  rol: 'Rol',
};

/* RESUMEN
   Etiquetas y opciones de la agenda (roles dueño/comprador, seguimiento, estado civil, origen,
   prioridad y estado de pedidos) más los nombres de campos para los avisos de error. Separado de los
   schemas para no mandar Zod al navegador. Depende de: nada */
