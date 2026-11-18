-- supabase/migrations/009_provincia_barrio.sql
-- Provincia y barrio de cada propiedad (filtros del sitio: ciudad -> barrio) y limpieza de localidades
-- mal cargadas. Idempotente: se puede correr más de una vez. Independiente de la 008.

-- ========== COLUMNAS ==========
alter table public.propiedades
  add column if not exists provincia text check (provincia is null or char_length(provincia) <= 60),
  add column if not exists barrio text check (barrio is null or char_length(barrio) <= 80);

create index if not exists idx_propiedades_lugar on public.propiedades (localidad, barrio);

-- ========== LOCALIDADES MAL CARGADAS ==========
-- "Juan Pujol Corrientes" y la quinta cargada como localidad "Corrientes" con dirección "Juan Pujol"
update public.propiedades set localidad = 'Juan Pujol'
  where localidad = 'Juan Pujol Corrientes'
     or (localidad = 'Corrientes' and direccion = 'Juan Pujol');
update public.propiedades set localidad = 'Sáenz Valiente' where localidad = 'Saenz Valiente';

-- ========== PROVINCIA (según coordenadas: el río Mocoretá separa Entre Ríos de Corrientes) ==========
update public.propiedades set provincia = 'Corrientes'
  where provincia is null
    and localidad in ('Mocoretá', 'Juan Pujol', 'Colonia Piedrita', 'Sáenz Valiente',
                      'Paso de los Libres', 'Corrientes');
update public.propiedades set provincia = 'Entre Ríos'
  where provincia is null
    and localidad in ('Chajarí', 'Santa Ana', 'Colonia Ensanche Sauce', 'Villa del Rosario',
                      'Colonia Belgrano', 'San Pedro', 'Federación', 'Los Conquistadores',
                      'Colonia San Ramón', 'Colonia San Roque', 'Tatutí', 'La Florida',
                      'Colonia Santa María', 'La Paz', 'San Jaime de la Frontera');
-- Confirmado por el cliente (2026-11-18) y ya corregido en la base: "Corrientes" (Paraje Piedritas)
-- -> Colonia Piedrita y "Departamento Curuzú" (San Jaime) -> San Jaime de la Frontera.

-- ========== BARRIOS que ya figuraban en la dirección (Chajarí) ==========
update public.propiedades set barrio = 'Las 14'
  where barrio is null and localidad = 'Chajarí' and direccion ilike '%barrio las 14%';
update public.propiedades set barrio = 'Tagüé'
  where barrio is null and localidad = 'Chajarí' and direccion ilike '%barrio tagüé%';
update public.propiedades set barrio = 'Citrícola'
  where barrio is null and localidad = 'Chajarí' and direccion ilike '%barrio citrícola%';

notify pgrst, 'reload schema';

/* RESUMEN
   Migración 009: columnas propiedades.provincia y barrio (+ índice localidad/barrio), unifica "Juan Pujol
   Corrientes" y "Saenz Valiente", asigna provincia por localidad (Corrientes / Entre Ríos según
   coordenadas) y carga los barrios que ya estaban en la dirección (Las 14, Tagüé, Citrícola).
   Depende de: supabase/schema.sql */
