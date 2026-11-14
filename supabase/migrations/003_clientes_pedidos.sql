-- supabase/migrations/003_clientes_pedidos.sql
-- Agenda de clientes (con sus propiedades de interés) y Carpeta de pedidos (agenda personal del dueño).
-- Todo es PRIVADO: solo lo ve y edita un administrador. Nada de esto se lee desde el sitio público.
-- Ejecutar UNA vez en el SQL Editor de Supabase. Es idempotente (se puede volver a correr sin romper).

-- ========== CLIENTES ==========
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(trim(nombre)) between 2 and 120),
  telefono text check (char_length(telefono) <= 30),
  email text check (char_length(email) <= 160),
  localidad text,
  -- Lo que busca, en sus palabras (ej. "casa 3 dormitorios con patio, zona centro")
  busca text,
  presupuesto numeric(14,2) check (presupuesto >= 0),
  moneda text not null default 'USD' check (moneda in ('ARS','USD')),
  categoria_id bigint references public.categorias (id) on delete set null,
  notas text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_clientes_nombre on public.clientes (lower(nombre));
create index if not exists idx_clientes_telefono on public.clientes (telefono);
create index if not exists idx_clientes_activo on public.clientes (activo, created_at desc);

drop trigger if exists trg_clientes_updated on public.clientes;
create trigger trg_clientes_updated before update on public.clientes
  for each row execute function public.set_updated_at();

-- ========== CLIENTE <-> PROPIEDADES (casas a la vista / de interés) ==========
-- Un cliente puede tener una o varias propiedades a la vista; una propiedad, varios clientes.
create table if not exists public.cliente_propiedades (
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  propiedad_id uuid not null references public.propiedades (id) on delete cascade,
  estado text not null default 'interesado'
    check (estado in ('interesado','visita_agendada','visito','oferto','descartada')),
  fecha_visita timestamptz,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (cliente_id, propiedad_id)
);

create index if not exists idx_cliente_propiedades_propiedad on public.cliente_propiedades (propiedad_id);

drop trigger if exists trg_cliente_propiedades_updated on public.cliente_propiedades;
create trigger trg_cliente_propiedades_updated before update on public.cliente_propiedades
  for each row execute function public.set_updated_at();

-- ========== CARPETA DE PEDIDOS (agenda personal del dueño) ==========
-- Cada nota es de quien la crea (autor_id): si mañana se suma otro administrador, no ve esta agenda.
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(trim(titulo)) between 2 and 160),
  detalle text,
  fecha date,
  hora time,
  prioridad text not null default 'normal' check (prioridad in ('baja','normal','alta')),
  estado text not null default 'pendiente' check (estado in ('pendiente','hecho','cancelado')),
  cliente_id uuid references public.clientes (id) on delete set null,
  propiedad_id uuid references public.propiedades (id) on delete set null,
  completado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pedidos_agenda on public.pedidos (autor_id, estado, fecha, hora);
create index if not exists idx_pedidos_cliente on public.pedidos (cliente_id);
create index if not exists idx_pedidos_propiedad on public.pedidos (propiedad_id);

drop trigger if exists trg_pedidos_updated on public.pedidos;
create trigger trg_pedidos_updated before update on public.pedidos
  for each row execute function public.set_updated_at();

-- Marca/limpia completado_en según el estado
create or replace function public.pedidos_completado()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  if new.estado = 'hecho' and (tg_op = 'INSERT' or old.estado is distinct from 'hecho') then
    new.completado_en = now();
  elsif new.estado <> 'hecho' then
    new.completado_en = null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_pedidos_completado on public.pedidos;
create trigger trg_pedidos_completado before insert or update on public.pedidos
  for each row execute function public.pedidos_completado();

-- ========== GRANTS (nada para anon) ==========
revoke all on public.clientes, public.cliente_propiedades, public.pedidos from anon;
grant select, insert, update, delete
  on public.clientes, public.cliente_propiedades, public.pedidos to authenticated;

-- ========== RLS ==========
alter table public.clientes enable row level security;
alter table public.cliente_propiedades enable row level security;
alter table public.pedidos enable row level security;

drop policy if exists clientes_admin on public.clientes;
create policy clientes_admin on public.clientes for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

drop policy if exists cliente_propiedades_admin on public.cliente_propiedades;
create policy cliente_propiedades_admin on public.cliente_propiedades for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

drop policy if exists pedidos_propios on public.pedidos;
create policy pedidos_propios on public.pedidos for all to authenticated
  using ((select public.es_admin()) and autor_id = (select auth.uid()))
  with check ((select public.es_admin()) and autor_id = (select auth.uid()));

-- Que la API (PostgREST) vea las tablas nuevas sin esperar
notify pgrst, 'reload schema';

/* RESUMEN
   Migración 003: tablas clientes, cliente_propiedades (N a N con estado de interés y visita) y pedidos
   (Carpeta de pedidos: agenda personal por autor, con fecha, hora, prioridad y estado). Triggers de
   updated_at y completado_en, índices y RLS solo admin (pedidos: además solo el autor).
   Depende de: supabase/schema.sql (es_admin, set_updated_at, categorias, propiedades) */
