-- supabase/migrations/006_medidas_migracion.sql
-- Medidas que usaba la web vieja (frente, fondo, semicubierta) y datos para importar desde MySQL.
-- Ejecutar UNA vez en el SQL Editor de Supabase ANTES de usar esta versión del sitio y antes de
-- correr scripts/migrate-mysql.js: las consultas ya piden estas columnas.
-- Las hectáreas no llevan columna propia: se guardan en superficie_total (1 ha = 10.000 m²) y el
-- sitio las muestra como "ha" desde 10.000 m².

alter table public.propiedades
  add column if not exists medida_frente numeric(10,2) check (medida_frente > 0),
  add column if not exists medida_fondo numeric(10,2) check (medida_fondo > 0),
  add column if not exists superficie_semicubierta numeric(12,2) check (superficie_semicubierta > 0),
  add column if not exists id_viejo integer unique,
  add column if not exists slug_viejo text;

comment on column public.propiedades.id_viejo is 'id en la base MySQL vieja (solo migración).';
comment on column public.propiedades.slug_viejo is 'slug de la web vieja, para las redirecciones 301.';

notify pgrst, 'reload schema';

/* RESUMEN
   Migración 006: agrega medida_frente, medida_fondo y superficie_semicubierta a propiedades, más
   id_viejo (único, evita duplicar al reimportar) y slug_viejo (redirecciones 301). Idempotente.
   Depende de: supabase/schema.sql */
