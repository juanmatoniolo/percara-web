-- supabase/migrations/010_cdn_propio.sql
-- Pasa las URLs de fotos y OG del subdominio de prueba r2.dev al CDN propio.
-- CORRER SOLO DESPUÉS de que https://cdn.inmobiliariapercara.com sirva los archivos (dominio conectado
-- al bucket percara-media en Cloudflare) y de cambiar R2_PUBLIC_URL en Vercel.
-- Es reversible: correr el mismo UPDATE con las URLs invertidas.

begin;

update public.propiedades
set
  imagenes = replace(
    imagenes::text,
    'https://pub-8a07b2867efd49a5b0e0cbac329a91c1.r2.dev/',
    'https://cdn.inmobiliariapercara.com/'
  )::jsonb,
  og_image_url = replace(
    og_image_url,
    'https://pub-8a07b2867efd49a5b0e0cbac329a91c1.r2.dev/',
    'https://cdn.inmobiliariapercara.com/'
  )
where imagenes::text like '%r2.dev/%' or og_image_url like '%r2.dev/%';

-- Control: debe dar 0
select count(*) as quedan_en_r2_dev
from public.propiedades
where imagenes::text like '%r2.dev/%' or og_image_url like '%r2.dev/%';

commit;

/* RESUMEN
   Migra a https://cdn.inmobiliariapercara.com las URLs guardadas en propiedades.imagenes (jsonb) y
   propiedades.og_image_url. No mueve archivos: el bucket es el mismo, cambia solo el dominio.
   Depende de: dominio propio conectado a R2 y R2_PUBLIC_URL actualizado en Vercel. */
