-- supabase/migrations/002_mostrar_precio.sql
-- Permite cargar el precio pero ocultarlo en el sitio ("Consultar precio").
-- Ejecutar UNA vez en el SQL Editor de Supabase ANTES de usar esta versión del sitio:
-- las consultas ya piden esta columna.

alter table public.propiedades
  add column if not exists mostrar_precio boolean not null default true;

-- El cliente solo vende: toda propiedad nueva es venta por defecto
alter table public.propiedades
  alter column operacion set default 'venta';

/* RESUMEN
   Migración 002: agrega propiedades.mostrar_precio (boolean, default true) y deja 'venta' como valor
   por defecto de operacion. Idempotente. Depende de: supabase/schema.sql */
