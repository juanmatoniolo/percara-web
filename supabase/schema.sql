-- supabase/schema.sql

-- ========== ADMINISTRADORES ==========
create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.administradores enable row level security;
revoke all on public.administradores from anon, authenticated;

create or replace function public.es_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.administradores where user_id = (select auth.uid())
  );
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ========== CATEGORIAS ==========
create table if not exists public.categorias (
  id bigint generated always as identity primary key,
  nombre text not null unique,
  slug text not null unique,
  orden smallint not null default 0
);

-- ========== PROPIEDADES ==========
create table if not exists public.propiedades (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  descripcion text,
  precio numeric(14,2) check (precio >= 0),
  moneda text not null default 'USD' check (moneda in ('ARS','USD')),
  operacion text not null check (operacion in ('venta','alquiler')),
  categoria_id bigint not null references public.categorias (id) on delete restrict,
  localidad text,
  direccion text,
  lat double precision,
  lng double precision,
  superficie_total numeric(12,2),
  superficie_cubierta numeric(12,2),
  ambientes smallint,
  dormitorios smallint,
  banos smallint,
  cochera boolean not null default false,
  imagenes jsonb not null default '[]'::jsonb check (jsonb_typeof(imagenes) = 'array'),
  og_image_url text,
  destacada boolean not null default false,
  estado text not null default 'borrador' check (estado in ('borrador','publicada','vendida')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_propiedades_categoria on public.propiedades (categoria_id);
create index if not exists idx_propiedades_operacion on public.propiedades (operacion);
create index if not exists idx_propiedades_estado on public.propiedades (estado);
create index if not exists idx_propiedades_creada on public.propiedades (created_at desc);
create index if not exists idx_propiedades_destacada on public.propiedades (destacada) where destacada;

drop trigger if exists trg_propiedades_updated on public.propiedades;
create trigger trg_propiedades_updated before update on public.propiedades
  for each row execute function public.set_updated_at();

-- ========== CONFIGURACION (fila unica) ==========
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

drop trigger if exists trg_configuracion_updated on public.configuracion;
create trigger trg_configuracion_updated before update on public.configuracion
  for each row execute function public.set_updated_at();

insert into public.configuracion (id) values (true) on conflict (id) do nothing;

-- ========== GRANTS ==========
grant select on public.categorias, public.propiedades, public.configuracion to anon, authenticated;
grant insert, update, delete on public.categorias, public.propiedades to authenticated;
grant update on public.configuracion to authenticated;

-- ========== RLS ==========
alter table public.categorias enable row level security;
alter table public.propiedades enable row level security;
alter table public.configuracion enable row level security;

drop policy if exists categorias_lectura on public.categorias;
create policy categorias_lectura on public.categorias for select using (true);
drop policy if exists categorias_admin on public.categorias;
create policy categorias_admin on public.categorias for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

drop policy if exists propiedades_lectura on public.propiedades;
create policy propiedades_lectura on public.propiedades for select
  using (estado = 'publicada' or (select public.es_admin()));
drop policy if exists propiedades_admin on public.propiedades;
create policy propiedades_admin on public.propiedades for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

drop policy if exists configuracion_lectura on public.configuracion;
create policy configuracion_lectura on public.configuracion for select using (true);
drop policy if exists configuracion_admin on public.configuracion;
create policy configuracion_admin on public.configuracion for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- ========== SEED ==========
insert into public.categorias (nombre, slug, orden) values
  ('Campos', 'campos', 1),
  ('Casas', 'casas', 2),
  ('Departamentos', 'departamentos', 3),
  ('Forestaciones', 'forestaciones', 4),
  ('Galpones', 'galpones', 5),
  ('Locales y oficinas', 'locales-y-oficinas', 6),
  ('Quintas', 'quintas', 7),
  ('Terrenos', 'terrenos', 8),
  ('Otras propiedades', 'otras-propiedades', 9)
on conflict (slug) do nothing;

/* RESUMEN
   Esquema completo de Supabase: administradores, categorias, propiedades y configuracion
   con indices, triggers de updated_at, RLS (lectura publica solo de 'publicada'; escritura solo admin)
   y seed de categorias. Depende de: auth.users. Ejecutar una vez en el SQL Editor. */
'@ | Set-Content -Encoding UTF8 supabase\schema.sql

Get-Content supabase\schema.sql -Raw | Set-Clipboard