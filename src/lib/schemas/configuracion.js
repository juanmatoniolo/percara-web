// src/lib/schemas/configuracion.js
import { z } from 'zod';
import { textoOpcional } from './campos';
import { normalizarTelefono } from '@/lib/telefono';
import { usuarioRed } from '@/lib/contacto';

const telefono = (msg) =>
  z
    .string()
    .trim()
    .min(6, msg)
    .max(30, 'Máximo 30 caracteres.')
    .refine((v) => normalizarTelefono(v) !== null, msg);

const red = z.preprocess(
  (v) => usuarioRed(v),
  z
    .string()
    .max(80)
    .regex(/^[\w.\-]+$/, 'Escriba solo el usuario o pegue el link del perfil.')
    .nullable(),
);

export const configuracionSchema = z.object({
  telefono: telefono('Teléfono inválido. Ej.: +54 9 3456 55-3422'),
  whatsapp: telefono('Número de WhatsApp inválido. Ej.: 3456 55-3422'),
  email: z.string().trim().email('Email inválido.').max(160),
  direccion: z.string().trim().min(3, 'Escriba la dirección.').max(160),
  localidad: z.string().trim().min(2, 'Escriba la localidad.').max(80),
  provincia: z.string().trim().min(2, 'Escriba la provincia.').max(80),
  maps_url: textoOpcional(500).refine(
    (v) =>
      v === null ||
      /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(v),
    'Pegue el link de Google Maps (empieza con https://maps.app.goo.gl o https://www.google.com/maps).',
  ),
  instagram: red,
  facebook: red,
});

/* RESUMEN
   Schema Zod de los datos de contacto de la inmobiliaria: teléfono y WhatsApp (deben poder usarse en
   wa.me / tel:), email, dirección, localidad, provincia, link de Maps opcional y redes (usuario o link,
   se guarda solo el usuario). Depende de: zod, ./campos.js, lib/telefono.js, lib/contacto.js */
