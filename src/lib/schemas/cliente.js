// src/lib/schemas/cliente.js
import { z } from 'zod';
import { checkbox, enumOpcional, fechaOpcional, textoOpcional, uuidSchema } from './campos';
import { ESTADOS_CIVILES, ESTADOS_INTERES, ORIGENES, ROLES } from './agenda-etiquetas';

const claves = (o) => /** @type {[string, ...string[]]} */ (Object.keys(o));

const telefono = textoOpcional(30, 'Máximo 30 caracteres.').refine(
  (v) => v === null || /^[\d\s()+\-.]{6,30}$/.test(v),
  'Use solo números, espacios, guiones o +.',
);

export const clienteSchema = z.object({
  nombre: z.string().trim().min(2, 'Escriba el nombre.').max(120, 'Máximo 120 caracteres.'),
  telefono,
  telefono_alt: telefono,
  email: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() ? v.trim() : null),
    z.string().email('Email inválido.').max(160).nullable(),
  ),
  localidad: textoOpcional(80),
  /* Lo que busca (busca, presupuesto, categoría) ya no se carga acá: va a la Carpeta de pedidos.
     Las columnas siguen en la tabla y no se tocan al guardar. */
  notas: textoOpcional(3000),
  activo: checkbox,
  /* Datos opcionales para reserva y escritura */
  dni_cuit: textoOpcional(20).refine(
    (v) => v === null || /^[\d.\-\s]{7,20}$/.test(v),
    'Solo números, puntos o guiones.',
  ),
  fecha_nacimiento: fechaOpcional,
  nacionalidad: textoOpcional(60),
  estado_civil: enumOpcional(claves(ESTADOS_CIVILES)),
  conyuge: textoOpcional(160),
  profesion: textoOpcional(80),
  domicilio: textoOpcional(200),
  origen: enumOpcional(claves(ORIGENES)),
});

/** Alta o cambio de un vínculo cliente <-> propiedad. El estado solo aplica a compradores. */
export const vinculoSchema = z
  .object({
    cliente_id: uuidSchema,
    propiedad_id: uuidSchema,
    rol: z.enum(claves(ROLES), { error: 'Elija si es dueño o comprador.' }),
    estado: enumOpcional(claves(ESTADOS_INTERES)),
    notas: textoOpcional(500),
  })
  .transform((v) => ({
    ...v,
    estado: v.rol === 'propietario' ? null : (v.estado ?? 'interesado'),
  }));

export const estadoInteresSchema = z.enum(claves(ESTADOS_INTERES));

/* RESUMEN
   Schemas Zod de la agenda de clientes: clienteSchema (contacto, notas y datos opcionales para
   escritura; lo que busca va a la Carpeta de pedidos) y vinculoSchema (cliente + propiedad + rol; el estado se fuerza a null si es
   dueño). Depende de: zod, ./campos.js, ./agenda-etiquetas.js */
