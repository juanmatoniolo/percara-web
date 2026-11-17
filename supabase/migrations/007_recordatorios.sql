-- supabase/migrations/007_recordatorios.sql
-- Recordatorios: registro de cada negocio cerrado (cliente + propiedad + cómo se pagó) con sus cuotas,
-- para tener a mano vencimientos y condiciones. Privado: solo administradores (nunca el sitio).
-- Ejecutar UNA vez en el SQL Editor de Supabase.

create table if not exists public.recordatorios (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid default auth.uid() references auth.users (id) on delete set null,
  cliente_id uuid references public.clientes (id) on delete set null,
  propiedad_id uuid references public.propiedades (id) on delete set null,
  titulo text not null check (char_length(trim(titulo)) between 2 and 160),
  fecha_operacion date,
  -- Cómo fue el negocio
  forma_pago text not null default 'contado'
    check (forma_pago in ('contado', 'financiado', 'cuotas', 'permuta', 'mixto')),
  medio_pago text
    check (medio_pago in ('efectivo', 'transferencia', 'cheque', 'mixto', 'otro')),
  moneda text not null default 'USD' check (moneda in ('USD', 'ARS')),
  monto_total numeric(14,2) check (monto_total >= 0),
  anticipo numeric(14,2) check (anticipo >= 0),
  -- Cuotas (si corresponde): pueden ir en otra moneda que el total
  cantidad_cuotas smallint check (cantidad_cuotas between 1 and 600),
  monto_cuota numeric(14,2) check (monto_cuota >= 0),
  moneda_cuotas text check (moneda_cuotas in ('USD', 'ARS')),
  primer_vencimiento date,
  estado text not null default 'en_curso'
    check (estado in ('en_curso', 'finalizado', 'cancelado')),
  observaciones text check (char_length(observaciones) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recordatorios_estado on public.recordatorios (estado, fecha_operacion desc);
create index if not exists idx_recordatorios_cliente on public.recordatorios (cliente_id);
create index if not exists idx_recordatorios_propiedad on public.recordatorios (propiedad_id);

drop trigger if exists trg_recordatorios_updated on public.recordatorios;
create trigger trg_recordatorios_updated before update on public.recordatorios
  for each row execute function public.set_updated_at();

-- ========== GRANTS (nada para anon) ==========
revoke all on public.recordatorios from anon;
grant select, insert, update, delete on public.recordatorios to authenticated;

-- ========== RLS: compartido entre administradores ==========
alter table public.recordatorios enable row level security;

drop policy if exists recordatorios_admin on public.recordatorios;
create policy recordatorios_admin on public.recordatorios for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

notify pgrst, 'reload schema';

/* RESUMEN
   Migración 007: tabla recordatorios (negocio cerrado: cliente, propiedad, forma y medio de pago, moneda,
   total, anticipo, cuotas con su moneda y primer vencimiento, estado y observaciones). Trigger updated_at,
   índices y RLS solo admin. Depende de: schema.sql (es_admin, set_updated_at), migración 003 (clientes) */
