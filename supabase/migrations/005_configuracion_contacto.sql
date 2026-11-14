-- supabase/migrations/005_configuracion_contacto.sql
-- Datos de contacto de la inmobiliaria editables desde el panel (/dashboard/configuracion).
-- Usa la tabla `configuracion` (fila única) de schema.sql: la crea si falta, suma las columnas nuevas y
-- carga los datos actuales del sitio solo donde estén vacíos. Idempotente.

create table if not exists public.configuracion (
  id boolean primary key default true check (id),
  telefono text,
  whatsapp text,
  email text,
  direccion text,
  redes jsonb not null default '{}'::jsonb,
  horarios jsonb not null default '{}'::jsonb,
  texto_sobre_nosotros text,
  updated_at timestamptz not null default now()
);

alter table public.configuracion
  add column if not exists localidad text,
  add column if not exists provincia text,
  add column if not exists maps_url text,
  add column if not exists instagram text,
  add column if not exists facebook text;

drop trigger if exists trg_configuracion_updated on public.configuracion;
create trigger trg_configuracion_updated before update on public.configuracion
  for each row execute function public.set_updated_at();

-- Fila única con los datos que hoy muestra el sitio (solo completa lo vacío)
insert into public.configuracion (id) values (true) on conflict (id) do nothing;

update public.configuracion set
  telefono  = coalesce(nullif(telefono, ''),  '+54 9 3456 55-3422'),
  whatsapp  = coalesce(nullif(whatsapp, ''),  '+54 9 3456 55-3422'),
  email     = coalesce(nullif(email, ''),     'Inmobiliariapercara@hotmail.com'),
  direccion = coalesce(nullif(direccion, ''), 'Salvarredy 1919'),
  localidad = coalesce(nullif(localidad, ''), 'Chajarí'),
  provincia = coalesce(nullif(provincia, ''), 'Entre Ríos'),
  instagram = coalesce(nullif(instagram, ''), 'percaranegociosinmobiliarios'),
  facebook  = coalesce(nullif(facebook, ''),  'inmobiliariapercara')
where id;

-- Lectura pública (son los datos que muestra el sitio); solo el admin edita
grant select on public.configuracion to anon, authenticated;
grant update on public.configuracion to authenticated;
alter table public.configuracion enable row level security;

drop policy if exists configuracion_lectura on public.configuracion;
create policy configuracion_lectura on public.configuracion for select using (true);
drop policy if exists configuracion_admin on public.configuracion;
create policy configuracion_admin on public.configuracion for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

notify pgrst, 'reload schema';

/* RESUMEN
   Migración 005: asegura la tabla configuracion (fila única), agrega localidad, provincia, maps_url,
   instagram y facebook, carga los datos de contacto actuales donde falten y deja lectura pública y
   edición solo admin. Depende de: supabase/schema.sql (set_updated_at, es_admin) */
