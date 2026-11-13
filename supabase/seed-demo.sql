-- supabase/seed-demo.sql
-- Propiedades DE PRUEBA (una por categoría) para ver listados, pestañas, cards y detalle.
-- Son ficticias: slug con prefijo "demo-" y la descripción lo aclara. BORRAR antes del lanzamiento
-- (ver bloque LIMPIEZA al final). Ejecutar en el SQL Editor de Supabase (rol postgres, ignora RLS).

insert into public.propiedades
  (titulo, slug, descripcion, precio, moneda, operacion, categoria_id, localidad, direccion,
   superficie_total, superficie_cubierta, ambientes, dormitorios, banos, cochera, imagenes, destacada, estado)
select
  d.titulo, d.slug, d.descripcion, d.precio, d.moneda, 'venta', c.id, d.localidad, d.direccion,
  d.sup_total, d.sup_cubierta, d.ambientes, d.dormitorios, d.banos, d.cochera, d.imagenes::jsonb, d.destacada, 'publicada'
from (values
  ('casas', 'Casa moderna de dos plantas con cochera', 'demo-casa-moderna-dos-plantas',
   'Propiedad de ejemplo para pruebas del sitio. Casa de dos plantas con living comedor, cocina integrada, tres dormitorios y patio con espacio verde.',
   185000, 'USD', 'Chajarí', 'Barrio Centro', 450, 210, 5, 3, 2, true,
   '[{"url":"/banner.webp","alt":"Fachada de casa moderna de dos plantas","orden":0,"ancho":1024,"alto":434}]', true),
  ('campos', 'Campo agrícola ganadero sobre ruta', 'demo-campo-agricola-ganadero',
   'Propiedad de ejemplo para pruebas del sitio. Campo con aguadas, alambrado perimetral y acceso por camino consolidado.',
   950000, 'USD', 'Chajarí', 'Zona rural', 1200000, null, null, null, null, false, '[]', true),
  ('departamentos', 'Departamento de un dormitorio céntrico', 'demo-departamento-un-dormitorio',
   'Propiedad de ejemplo para pruebas del sitio. Departamento luminoso con balcón, a pocas cuadras de la plaza.',
   62000, 'USD', 'Chajarí', 'Centro', 55, 50, 2, 1, 1, false, '[]', false),
  ('forestaciones', 'Forestación de eucaliptus en producción', 'demo-forestacion-eucaliptus',
   'Propiedad de ejemplo para pruebas del sitio. Lote forestado con eucaliptus y caminos internos.',
   420000, 'USD', 'Santa Ana', 'Zona rural', 850000, null, null, null, null, false, '[]', false),
  ('galpones', 'Galpón con oficina y playa de maniobras', 'demo-galpon-con-oficina',
   'Propiedad de ejemplo para pruebas del sitio. Galpón con portón amplio, oficina, baño y playa de maniobras para camiones.',
   140000, 'USD', 'Chajarí', 'Parque Industrial', 1500, 600, 3, null, 1, true, '[]', false),
  ('locales-y-oficinas', 'Local comercial sobre avenida', 'demo-local-comercial-avenida',
   'Propiedad de ejemplo para pruebas del sitio. Local con vidriera a la calle, depósito y baño.',
   98000, 'USD', 'Chajarí', 'Avenida principal', 120, 110, 2, null, 1, false, '[]', false),
  ('quintas', 'Quinta con pileta y quincho', 'demo-quinta-pileta-quincho',
   'Propiedad de ejemplo para pruebas del sitio. Quinta parquizada con pileta, quincho y casa de fin de semana.',
   120000, 'USD', 'Villa del Rosario', 'Zona de quintas', 5000, 140, 4, 2, 1, true, '[]', true),
  ('terrenos', 'Terreno en barrio residencial', 'demo-terreno-barrio-residencial',
   'Propiedad de ejemplo para pruebas del sitio. Lote con servicios, listo para construir.',
   28000000, 'ARS', 'Chajarí', 'Barrio residencial', 300, null, null, null, null, false, '[]', false),
  ('otras-propiedades', 'Cabaña de descanso cerca del lago', 'demo-cabana-descanso',
   'Propiedad de ejemplo para pruebas del sitio. Cabaña equipada en entorno natural.',
   null, 'USD', 'Federación', 'Zona costera', 800, 70, 3, 2, 1, false, '[]', false)
) as d(categoria_slug, titulo, slug, descripcion, precio, moneda, localidad, direccion,
       sup_total, sup_cubierta, ambientes, dormitorios, banos, cochera, imagenes, destacada)
join public.categorias c on c.slug = d.categoria_slug
on conflict (slug) do nothing;

-- Verificación: debe devolver 9 filas, una por categoría
select c.nombre, p.titulo, p.precio, p.moneda
from public.propiedades p join public.categorias c on c.id = p.categoria_id
where p.slug like 'demo-%' order by c.orden;

-- ========== LIMPIEZA (ejecutar antes del lanzamiento) ==========
-- delete from public.propiedades where slug like 'demo-%';

/* RESUMEN
   Inserta 9 propiedades ficticias publicadas (una por categoría, slug "demo-*") para probar listados,
   pestañas, cards, detalle y metadata; la casa usa /banner.webp como imagen y la cabaña no tiene precio
   ("Consultar precio"). Idempotente (on conflict). Depende de: supabase/schema.sql (categorias, propiedades) */
