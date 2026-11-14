-- supabase/migrations/004_propietarios_datos_cliente.sql
-- 1) Vincula a cada propiedad su dueño (o dueños) y sus posibles compradores, en la misma tabla.
-- 2) Suma datos opcionales del cliente útiles para la reserva y la escritura.
-- Ejecutar UNA vez en el SQL Editor de Supabase DESPUÉS de 003_clientes_pedidos.sql. Idempotente.

-- ========== ROL EN LA PROPIEDAD: comprador o propietario ==========
-- Se usa cliente_propiedades (y no una columna en propiedades) porque:
--  - una propiedad puede tener varios dueños (matrimonio, herederos, socios);
--  - la tabla propiedades es de lectura pública y no debe exponer ningún dato del dueño.
alter table public.cliente_propiedades
  add column if not exists rol text not null default 'comprador';

alter table public.cliente_propiedades
  drop constraint if exists cliente_propiedades_rol_check;
alter table public.cliente_propiedades
  add constraint cliente_propiedades_rol_check check (rol in ('comprador','propietario'));

-- El estado (interesado, visitó, ofertó...) solo tiene sentido para compradores
alter table public.cliente_propiedades alter column estado drop not null;

alter table public.cliente_propiedades
  drop constraint if exists cliente_propiedades_estado_rol_check;
alter table public.cliente_propiedades
  add constraint cliente_propiedades_estado_rol_check check (
    (rol = 'comprador' and estado is not null) or (rol = 'propietario' and estado is null)
  );

create index if not exists idx_cliente_propiedades_rol
  on public.cliente_propiedades (propiedad_id, rol);

-- ========== DATOS OPCIONALES DEL CLIENTE (reserva / escritura) ==========
alter table public.clientes
  add column if not exists telefono_alt text check (char_length(telefono_alt) <= 30),
  add column if not exists dni_cuit text check (char_length(dni_cuit) <= 20),
  add column if not exists fecha_nacimiento date,
  add column if not exists nacionalidad text,
  add column if not exists estado_civil text
    check (estado_civil in ('soltero','casado','divorciado','viudo','union_convivencial')),
  -- Nombre y DNI del cónyuge: el escribano los pide para el asentimiento conyugal
  add column if not exists conyuge text,
  add column if not exists profesion text,
  add column if not exists domicilio text,
  add column if not exists origen text
    check (origen in ('whatsapp','telefono','oficina','redes','web','recomendacion','cartel','otro'));

create index if not exists idx_clientes_dni_cuit on public.clientes (dni_cuit);

notify pgrst, 'reload schema';

/* RESUMEN
   Migración 004: agrega cliente_propiedades.rol ('comprador' | 'propietario'; el estado solo aplica a
   compradores) para ligar dueños y compradores a cada propiedad, y columnas opcionales en clientes
   (teléfono alternativo, DNI/CUIT, nacimiento, nacionalidad, estado civil, cónyuge, profesión,
   domicilio, origen). Depende de: supabase/migrations/003_clientes_pedidos.sql */
