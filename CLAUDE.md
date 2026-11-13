# Percara Negocios Inmobiliarios: contexto base

Leer SIEMPRE antes de escribir código o contenido. Detalle completo en los imports:
@docs/ESPECIFICACION.md
@docs/CONTEXTO-SITIO-ACTUAL.md
@docs/TRASPASO.md
@docs/REFERENCIAS-SITIOS.JSON
Estado actual, pendientes y decisiones recientes: docs/TRASPASO.md (fuente única; mantenerla al día).
Si existe docs/sitio-actual.json, usarlo como contenido semilla (textos, contacto, redes, forma de la API vieja). No inventar datos que no estén en esas fuentes: si falta un dato, dejar un TODO y preguntarme.

## Negocio

- Inmobiliaria de Chajarí, Entre Ríos, Argentina. Venta y alquiler. Dominio: https://inmobiliariapercara.com (sin www; es el canonical).
- Rehacemos la web desde cero. El sitio actual es una SPA React (CSR) con MySQL: Google recibe HTML vacío. Objetivo del nuevo: contenido indexable desde el primer byte, SEO local y previews de WhatsApp rápidas.
- Categorías: Campos, Casas, Departamentos, Forestaciones, Galpones, Locales y oficinas, Quintas, Terrenos, Otras propiedades.
- Idioma de la web y de los textos: español rioplatense (es-AR), tono profesional y cercano. Moneda ARS/USD. Teléfonos en formato Argentina.

## Metadata actual a conservar o mejorar

- title home: Casas, Campos y Terrenos en Venta | Inmobiliaria Percara (mantener las palabras clave y sumar "Chajarí").
- description: Compra y venta. Encuentra tu propiedad ideal con asesoramiento personalizado.
- robots: index, follow. og:type website. twitter:card summary_large_image.
- og:image actual: /percara.png (usarla solo como respaldo estático del sitio).
- google-site-verification: meP8QjZrYsX5mdA_ItrEyTV8H3ajxH4PCiKX8Q7dk4w -> ponerlo en `metadata.verification.google` del layout raíz. NO perderlo.

## Stack (JavaScript puro, PROHIBIDO .ts / .tsx)

- Next.js 15 App Router + React 19, componentes `.jsx`, lógica `.js`. Alias `@/*` -> `src/*`.
- Supabase (Postgres + Auth + RLS) con @supabase/ssr. Cloudflare R2 con @aws-sdk/client-s3. Sharp. Zod. Lucide React.
- CSS Modules + tokens en `src/styles/tokens.css`. SIN Tailwind.
- Tipos solo como @typedef JSDoc en `src/types/index.js`.

## Decisiones tomadas (mandan sobre la especificación si difieren)

- Categorías en `/categorias/[categoria]` (NO `/propiedades/categoria/[categoria]`, colisiona con `[slug]`).
- Login en `src/app/(auth)/login`, fuera de `(admin)`, para evitar loop de redirección del middleware.
- Imagen OG 1200x630 se genera AL SUBIR (Sharp) y se guarda en `og_image_url`. Nunca on-demand.
- Imágenes 4:3, WebP, tamaños 400/900/1600w, `blurDataURL`, sin EXIF.
- Login oculto (sin links); `/dashboard` sin sesión redirige a `/login`. Solo venta (operación fija).
  Precio con `mostrar_precio`. Coordenadas en un campo (formato de Google Maps).
- Fondo blanco, sin modo oscuro. Azul #042369 = acción; verde #27AE47 = detalles (texto verde con #1c8237).
- Sin `loading.jsx` en la raíz (soft 404). Lecturas públicas con tag `propiedades` + revalidateTag.

## Reglas de código (obligatorias)

1. Primera línea de cada archivo: comentario con su ruta exacta (`// src/...` o `/* src/... */` en CSS). Al final: bloque `RESUMEN` de 2 a 4 líneas (qué hace, qué recibe/devuelve, de qué depende). Nunca entregar código sin ruta ni resumen.
2. Flujo por feature: typedef JSDoc -> schema Zod -> query/action -> componente -> estilos.
3. Server Components por defecto. `"use client"` solo si es imprescindible; menos JS al cliente.
4. Mutaciones en Server Actions (`src/actions`). Lecturas públicas en `src/lib/queries` y Route Handlers por recurso en `src/app/api/*`.
5. Una responsabilidad por archivo. Máx. ~150 líneas por componente.
6. Nombres: componentes PascalCase, funciones camelCase, archivos kebab-case, tablas/columnas snake_case en español.
7. Errores: devolver `{ ok: false, error }`. Nunca stack traces al cliente ni secretos en logs.
8. Seguridad: el middleware no alcanza; cada Server Action y Route Handler admin verifica sesión. Módulos con secretos importan `server-only`. Variables vía `lib/env.js` (Zod). Solo SUPABASE_URL, SUPABASE_ANON_KEY y SITE_URL llevan `NEXT_PUBLIC_`.
9. Subidas: validar MIME real (magic bytes), máx. 10 MB, máx. 20 imágenes por propiedad, nombres uuid.
10. Contacto: honeypot + rate limit + Zod.

## SEO (siempre)

- `generateMetadata` en detalle y categorías: title, description, canonical, robots, Open Graph y Twitter.
- JSON-LD: RealEstateListing + Offer, RealEstateAgent/LocalBusiness, BreadcrumbList. `sitemap.js` dinámico, `robots.js`, `lang="es-AR"`.
- ISR con `revalidateTag` en cada alta, edición o baja. Redirecciones 301 desde las URLs viejas.
- Lighthouse objetivo >= 95. `priority` solo en la imagen LCP.

## Estilos

- Mobile-first, minimalista, mucho espacio en blanco. Todo valor sale de tokens (sin números mágicos).
- Orden fijo en cada `.module.css`: base 320 > 480 > 768 > 1024 > 1280 > 1536 > 1920 > landscape > hover/pointer > prefers-color-scheme > prefers-reduced-motion > print. Cada bloque comentado con su rango.
- Efectos solo con CSS (scroll-driven, View Transitions), desactivados con reduced-motion. Accesibilidad AA, foco visible, áreas táctiles >= 44px.

## Forma de trabajar

- Trabajo por FASES (1 a 8 de la especificación). Antes de codificar: plan corto (archivos a crear/modificar) y esperar mi OK. Al terminar: lista de 1 línea por archivo (ruta + nuevo/modificado), correr `npm run lint` y `npm run build`, y DETENERSE.
- Respuestas breves: sin introducciones ni despedidas ni explicaciones redundantes.
- Si algo de la especificación es mejorable o ambiguo, decirlo antes de implementar.
