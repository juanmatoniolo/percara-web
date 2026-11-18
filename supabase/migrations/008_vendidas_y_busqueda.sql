-- supabase/migrations/008_vendidas_y_busqueda.sql
-- 1) Propiedades vendidas visibles en el sitio por 60 días (renovables desde el panel).
-- 2) "Qué busca" del cliente dentro de la Carpeta de pedidos (tipo, presupuesto y moneda).
-- Ejecutar UNA vez en el SQL Editor de Supabase DESPUÉS de 007_recordatorios.sql. Idempotente.

-- ========== VENDIDAS VISIBLES 60 DÍAS ==========
alter table public.propiedades
  add column if not exists vendida_hasta timestamptz;

-- Al pasar a 'vendida' arranca la cuenta de 60 días; al salir de 'vendida' se limpia.
-- Se hace en la base para que valga igual desde el formulario, la lista o un UPDATE manual.
create or replace function public.set_vendida_hasta()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.estado = 'vendida' then
    if tg_op = 'INSERT' or old.estado is distinct from 'vendida' then
      new.vendida_hasta := coalesce(new.vendida_hasta, now() + interval '60 days');
    end if;
  else
    new.vendida_hasta := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_propiedades_vendida on public.propiedades;
create trigger trg_propiedades_vendida
  before insert or update of estado, vendida_hasta on public.propiedades
  for each row execute function public.set_vendida_hasta();

-- Las que ya estaban vendidas arrancan visibles 60 días desde hoy
update public.propiedades
  set vendida_hasta = now() + interval '60 days'
  where estado = 'vendida' and vendida_hasta is null;

-- Lectura pública: publicadas + vendidas dentro de su plazo (al vencer desaparecen solas)
drop policy if exists propiedades_lectura on public.propiedades;
create policy propiedades_lectura on public.propiedades for select
  using (
    estado = 'publicada'
    or (estado = 'vendida' and vendida_hasta > now())
    or (select public.es_admin())
  );

-- ========== QUÉ BUSCA, EN LA CARPETA DE PEDIDOS ==========
alter table public.pedidos
  add column if not exists categoria_id bigint references public.categorias (id) on delete set null,
  add column if not exists presupuesto numeric(14, 2) check (presupuesto is null or presupuesto >= 0),
  add column if not exists moneda text not null default 'USD' check (moneda in ('USD', 'ARS'));

notify pgrst, 'reload schema';

/* RESUMEN
   Migración 008: propiedades.vendida_hasta con trigger (vendida = hoy + 60 días; otro estado = null), las
   vendidas actuales visibles 60 días y RLS pública que muestra publicadas y vendidas vigentes. Suma a
   pedidos categoria_id, presupuesto y moneda ("qué busca" del cliente).
   Depende de: supabase/schema.sql (es_admin), migraciones 003 y 007 */
