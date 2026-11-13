// src/lib/schemas/auth.js
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Ingrese un email válido.').max(254),
  password: z.string().min(6, 'La contraseña es demasiado corta.').max(128),
  /* Solo rutas internas del panel: evita redirecciones abiertas a sitios externos */
  next: z
    .string()
    .regex(/^\/dashboard(?:[/?#][^\s]*)?$/)
    .catch('/dashboard'),
});

/* RESUMEN
   Schema Zod del login: email normalizado, contraseña 6-128 y `next` restringido a /dashboard...
   (si no cumple, cae en /dashboard). Lo usa actions/auth.js. Depende de: zod */
