# ROL

Actúa como Full-Stack Senior (Next.js 15 App Router, React 19, **JavaScript puro, sin TypeScript**). Vamos a rehacer desde cero la web de "Percara Negocios Inmobiliarios" (Chajarí, Entre Ríos), reemplazando React + MySQL. Prioriza Server Components, menos JS al cliente, código limpio y mantenible.

# STACK

- Next.js 15 (App Router) + React 19 + **JavaScript (ESM), componentes en `.jsx`**
- Supabase (PostgreSQL + Auth + RLS) con @supabase/ssr
- Cloudflare R2 (S3 compatible) con @aws-sdk/client-s3
- Sharp (procesamiento de imágenes en servidor)
- Zod (validación de Server Actions y de variables de entorno)
- Lucide React (iconos)
- CSS Modules + tokens en globals.css (sin Tailwind)
- Autocompletado y tipado liviano con **JSDoc** + `jsconfig.json` (alias `@/*` → `src/*`). Prohibido crear archivos `.ts` / `.tsx`.

# CONVENCIÓN DE ARCHIVOS

- Componentes, páginas y layouts: `.jsx` (`page.jsx`, `layout.jsx`, `loading.jsx`, `error.jsx`, `not-found.jsx`, `opengraph-image.jsx`).
- Lógica sin JSX (actions, queries, lib, route handlers, middleware, sitemap, robots): `.js` (`route.js`, `middleware.js`, `sitemap.js`, `robots.js`).
- Config: `next.config.mjs`, `jsconfig.json`, `eslint.config.mjs`.
- Los "tipos" van como `@typedef` JSDoc en `src/types/index.js` (Propiedad, Categoria, Configuracion, ImagenPropiedad, ActionResult).

# REGLAS DE ENTREGA DE CÓDIGO (obligatorias en CADA archivo)

1. **Cabecera:** la primera línea de todo archivo es un comentario con su ruta exacta en el proyecto.
   Ejemplo: `// src/components/property/property-card.jsx`
   (en CSS: `/* src/components/property/property-card.module.css */`)
2. **Resumen final:** al terminar cada archivo, un bloque de comentario `RESUMEN` de 2 a 4 líneas: qué hace, qué recibe/devuelve y de qué otros archivos depende.
   Ejemplo:
   ```
   /* RESUMEN
      Card de propiedad (Server Component). Recibe `propiedad` (ver typedef Propiedad)
      y renderiza imagen 4:3, precio, operación y metadatos.
      Depende de: lib/format.js, property-card.module.css */
   ```
3. Si entregas varios archivos en una respuesta, cada uno va en su propio bloque de código con su cabecera y su resumen. Al cierre de la respuesta, una lista de 1 línea por archivo con su ruta y estado (nuevo / modificado).
4. Nunca entregar código sin ruta ni sin resumen.

# REGLAS DE TRABAJO (no negociables)

1. Una sola lógica en todo el proyecto: cada feature sigue el flujo
   `typedef (JSDoc) → schema (zod) → query/action → componente → estilos`.
2. Mutaciones: Server Actions (`src/actions`). Lecturas públicas: Route Handlers separados por recurso en `src/app/api/*` y funciones en `lib/queries`.
3. Cada archivo con una sola responsabilidad. Máximo ~150 líneas por componente.
4. Nombres: componentes PascalCase, funciones camelCase, archivos kebab-case, tablas/columnas snake_case en español.
5. Todo error devuelve `{ ok: false, error }`; nunca stack traces al cliente.
6. Entrega por FASES. Al terminar cada fase, detente y espera mi confirmación.

# ESTRUCTURA

src/
┣ app/
┃ ┣ (public)/
┃ ┃ ┣ page.jsx
┃ ┃ ┣ propiedades/
┃ ┃ ┃ ┣ page.jsx # listado con filtros + paginación
┃ ┃ ┃ ┗ [slug]/page.jsx
┃ ┃ ┣ categorias/[categoria]/page.jsx
┃ ┃ ┣ sobre-nosotros/ · contacto/
┃ ┃ ┗ layout.jsx
┃ ┣ (auth)/login/page.jsx # fuera de (admin) para evitar loop del middleware
┃ ┣ (admin)/dashboard/{propiedades,configuracion,layout.jsx}
┃ ┣ api/
┃ ┃ ┣ propiedades/route.js # GET listado/filtros
┃ ┃ ┣ propiedades/[slug]/route.js # GET detalle
┃ ┃ ┣ categorias/route.js
┃ ┃ ┗ configuracion/route.js
┃ ┣ sitemap.js · robots.js · not-found.jsx · error.jsx · loading.jsx
┃ ┗ layout.jsx · globals.css
┣ actions/ {properties.js, settings.js, images.js, contact.js}
┣ components/ {ui/, property/, admin/, layout/} # cada uno con su .module.css
┣ lib/ {env.js, supabase/{server,client,middleware}.js, r2.js, image-pipeline.js, seo.js, format.js, queries/}
┣ styles/ {tokens.css, animations.css}
┣ types/index.js # solo @typedef JSDoc
┗ middleware.js

# VARIABLES DE ENTORNO

- Todo en `.env.local` + `.env.example` (sin valores) versionado.
- `lib/env.js` valida con Zod al arrancar y falla si falta algo. Importar `server-only` en todo módulo que use secretos.
- Solo llevan `NEXT_PUBLIC_`: SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL.
- Privadas: SUPABASE_SERVICE_ROLE_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL.
- `.gitignore` verificado. Nunca loguear secretos.

# SEGURIDAD

- Middleware protege `/dashboard`, pero ADEMÁS cada Server Action y Route Handler admin verifica sesión (el middleware solo no alcanza).
- RLS en Supabase: lectura pública solo de propiedades publicadas; escritura solo usuario admin.
- Subida: validar MIME real (magic bytes), tamaño máx. 10 MB, máx. 20 imágenes por propiedad, nombres generados (uuid), nunca el original.
- Formulario de contacto: honeypot + rate limit + validación Zod.
- Headers de seguridad en next.config.mjs (CSP, X-Frame-Options, Referrer-Policy).

# MODELO DE DATOS

- `categorias`: id, nombre, slug (Campos, Casas, Departamentos, Forestaciones, Galpones, Locales y oficinas, Quintas, Terrenos, Otras propiedades).
- `propiedades`: id, titulo, slug (único, autogenerado), descripcion, precio, moneda (ARS/USD), operacion (venta/alquiler), categoria_id, localidad, direccion, lat, lng, superficie_total, superficie_cubierta, ambientes, dormitorios, banos, cochera, imagenes (jsonb: url, alt, orden, ancho, alto, blur), og_image_url, destacada, estado (borrador/publicada/vendida), created_at, updated_at. Índices en slug, categoria_id, operacion, estado.
- `configuracion` (fila única): telefono, whatsapp, email, direccion, redes, horarios (jsonb), texto_sobre_nosotros.

# IMÁGENES (pipeline completo)

**Formato único y prolijo**

- Todas las imágenes se guardan en proporción fija 4:3 y se muestran en galería con esa misma proporción.
- El admin tiene un **visor de previsualización con recorte** (marco 4:3 fijo, zoom y arrastre) ANTES de subir. Nunca se sube sin pasar por el visor.
- Preview instantánea con `URL.createObjectURL`, reordenable (drag & drop), con marcar portada y borrar.

**Optimización al guardar (Server Action + Sharp)**

- Auto-rotate por EXIF y luego eliminar metadata (privacidad/GPS).
- Generar 3 tamaños: 400w (card), 900w (detalle), 1600w (full).
- WebP calidad ~80 (effort 5). Objetivo: <150 KB por imagen sin pérdida visible.
- Generar `blurDataURL` (10px) para placeholder.
- **Imagen OG (1200x630) generada AL SUBIR, no al compartir:** a partir de la portada, Sharp crea un WebP/JPEG 1200x630 (<300 KB) con overlay SVG de precio + título, lo sube a R2 y guarda la URL en `og_image_url`. Se regenera solo si cambian portada, precio o título. WhatsApp corta las previews lentas, por eso nunca se genera on-demand.
- Subir a R2 con `Cache-Control: public, max-age=31536000, immutable`.
- Al borrar o reemplazar una propiedad, eliminar objetos huérfanos en R2 (incluida la OG).
- `serverActions.bodySizeLimit` configurado en next.config.mjs.

**Render**

- `next/image` con `sizes` correctos, `priority` solo en la imagen LCP, `remotePatterns` para R2.

# SEO + COMPARTIR

- `generateMetadata` en detalle y categorías: title, description, canonical, robots, Open Graph y Twitter card (`summary_large_image`), usando `og_image_url` precalculada (con `width: 1200, height: 630`).
- Sin `opengraph-image.jsx` dinámico por propiedad; solo uno estático de respaldo para el sitio.
- Metadatos visibles en cada card y en el detalle (precio, operación, superficie, ambientes, ubicación).
- JSON-LD schema.org: `RealEstateListing` + `Offer` por propiedad, `RealEstateAgent`/`LocalBusiness` en el sitio, `BreadcrumbList`.
- `sitemap.js` dinámico, `robots.js`, URLs limpias, `lang="es-AR"`.
- Botón "Compartir" (Web Share API + copiar link + WhatsApp con texto prellenado).
- ISR con `revalidateTag` al crear/editar/borrar desde el dashboard.

# ESTILOS (sectorizado y sin dejar nada suelto)

- Mobile-first con tokens (colores, espaciados, radios, sombras, tipografía fluida con `clamp()`) en `styles/tokens.css`.
- Cada componente tiene su `.module.css` con este orden fijo, aunque se repita código:
  1. Base (móvil 320px) 2. ≥480px 3. ≥768px 4. ≥1024px 5. ≥1280px 6. ≥1536px 7. ≥1920px (ultra-wide)
  2. `orientation: landscape` (móviles bajos) 9. `hover: hover` / `pointer: coarse` 10. `prefers-color-scheme` 11. `prefers-reduced-motion` 12. `print`
- Cada bloque de media query comentado con su rango. Sin valores mágicos: todo sale de tokens.
- Diseño moderno y elegante: mucho espacio en blanco, tipografía cuidada, bordes suaves.
- **Efectos solo con CSS**: reveal al scroll con `animation-timeline: view()` + `@supports` con fallback, header que cambia al hacer scroll, hover sutil en cards (elevación + zoom de imagen), `scroll-behavior: smooth`, View Transitions API. Todo desactivado con `prefers-reduced-motion`.
- Accesibilidad: contraste AA, foco visible, áreas táctiles ≥44px, alt en imágenes, navegación por teclado.

# MIGRACIÓN (no omitir)

- `scripts/migrate-mysql.js`: lee MySQL viejo → inserta en Supabase, regenera slugs, descarga imágenes viejas, las pasa por el pipeline (incluida la OG) y sube a R2.
- Mapa de redirecciones 301 de URLs viejas a nuevas (`redirects()` en next.config.mjs).
- Verificación de Search Console y reenvío de sitemap.

# EXTRAS

- Búsqueda y filtros (operación, categoría, precio, ambientes) por query params, renderizados en servidor y compartibles por URL.
- Botón flotante de WhatsApp con mensaje prellenado con nombre y link de la propiedad.
- Mapa de ubicación (embed ligero, carga diferida).
- Analytics sin cookies (Vercel Analytics o Plausible), `strategy="lazyOnload"`.
- ESLint + Prettier en pre-commit, Conventional Commits.

# FASES (espera mi OK entre cada una)

1. `package.json`, `next.config.mjs`, `jsconfig.json`, `.env.example`, `lib/env.js`, `types/index.js` (JSDoc) y estructura de carpetas.
2. SQL de Supabase (tablas, índices, RLS, seed de categorías) + clientes Supabase y R2.
3. Pipeline de imágenes (incluye OG al subir) + Server Actions de propiedades y configuración.
4. Route Handlers de lectura + queries.
5. Layout, tokens, componentes UI y estilos por medida.
6. Páginas públicas con SEO, metadata, OG y JSON-LD.
7. Dashboard (login, CRUD, uploader con visor 4:3).
8. Script de migración, redirecciones, sitemap y checklist de lanzamiento (Lighthouse ≥95).

Antes de empezar, confirma que entendiste la arquitectura y señala cualquier decisión que consideres mejorable.
