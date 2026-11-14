# TRASPASO DE CONTEXTO: Percara Negocios Inmobiliarios

Actualizado: 2026-11-14. Fuente única del estado del proyecto (antes estaba duplicado al final de
ESPECIFICACION.md y CONTEXTO-SITIO-ACTUAL.md). Continuar desde acá: no rehacer lo hecho y respetar
"Decisiones tomadas" y "Preferencias de trabajo".

## 1. Qué es

Web nueva de Percara Negocios Inmobiliarios (Chajarí, Entre Ríos). Reemplaza la SPA React + MySQL de
https://inmobiliariapercara.com (canonical, sin www). Objetivo: HTML indexable, SEO local, previews de
WhatsApp rápidas y panel para cargar propiedades. Idioma es-AR; textos del sitio en "usted".

## 2. Stack real (verificado con npm ls)

- Next.js 15.5.29 (App Router, NO 16) + React 19.3.1. JavaScript puro: `.jsx` / `.js`, PROHIBIDO `.ts/.tsx`.
- @supabase/supabase-js 2.119, @supabase/ssr 0.12.7, @aws-sdk/client-s3 3.x, sharp 0.35.5, zod 4.6.7,
  lucide-react, server-only. CSS Modules + tokens (`src/styles/tokens.css`), sin Tailwind.
- Windows + PowerShell. Ruta: `C:\Users\juanma\Desktop\percara-web`.

## 3. Reglas de código

Ver CLAUDE.md (cabecera con ruta + bloque RESUMEN, flujo typedef > Zod > query/action > componente >
estilos, Server Components por defecto, `{ ok: false, error }`, `server-only` en módulos con secretos,
máx. ~150 líneas por componente, orden fijo de media queries).

## 4. Decisiones tomadas (mandan sobre la especificación)

Rutas y arquitectura

- Categorías en `/categorias/[categoria]` (9 rutas estáticas, `dynamicParams = false`).
- Login OCULTO en `(auth)/login`: ningún link del sitio lleva ahí; `/dashboard` sin sesión redirige a
  `/login?next=...` (`next` solo acepta `/dashboard...`). `/login` y `/dashboard` con noindex y
  `Disallow` en robots.txt.
- Seguridad en 3 capas: middleware (solo `/dashboard/*`, renueva sesión) + `requireAdmin()` en layout y
  páginas + `assertAdmin()` en cada Server Action. Admin = fila en `public.administradores` (`es_admin()`).
- Lecturas públicas con cliente sin cookies (`lib/supabase/public.js`), cacheadas con tag
  `propiedades` (ISR 1 h); toda mutación hace `revalidateTag('propiedades')`.
- NO usar `loading.jsx` en la raíz: provoca streaming y convierte 404/redirect en 200 (soft 404). Se borró.
- `lib/env-public.js` valida solo las 3 NEXT_PUBLIC (las lecturas públicas no dependen de los secretos).

Negocio

- Solo VENTA: la operación no aparece en el formulario; siempre se guarda `venta`.
- Precio opcional visible: columna `mostrar_precio` (false = "Consultar precio" en sitio, metadata,
  OG y sin `price` en JSON-LD).
- Coordenadas: un solo campo donde se pega lo que copia Google Maps (`-30.76, -57.98`, también links con
  `@lat,lng`); se guarda en `lat`/`lng`.
- Slug se genera al crear (único: base, base-2...) y NO cambia al editar (no romper links compartidos).
- Ficha fija en cada card (pedido del cliente): Superficie, Habitaciones (`dormitorios`), Baños,
  Cochera Sí/No; "–" si falta. Sin campo "estado de conservación" (no existe en la base).
- Cifras confirmadas por el cliente: más de 10 años en el negocio, Chajarí y alrededores, compra y
  venta de inmuebles, atención personalizada.

Imágenes

- Visor de recorte 4:3 obligatorio antes de subir (cliente, canvas, JPEG 0.9, máx. 2400 px).
- Subida de a una foto por Server Action (en fila, nunca en paralelo). Servidor: magic bytes
  (JPEG/PNG/WebP), 10 MB, máx. 20 por propiedad, uuid, sin EXIF/GPS, WebP q80 400/900/1600 + blur 10px.
- R2: `propiedades/{id}/{uuid}-{400|900|1600}.webp` y `propiedades/{id}/og-{uuid}.jpg`, Cache-Control
  inmutable. En la base se guarda la URL de la variante 1600; `src/lib/image-loader.js` (loaderFile de
  next/image) elige 400/900/1600 sin el optimizador de Next.
- OG 1200x630 JPEG (~70 KB) al subir: portada + degradado azul + precio en píldora verde + título +
  marca, con Montserrat Bold incluida (`src/assets/fonts`, licencia OFL) para que funcione en Vercel.
  Se regenera si cambia portada, título, precio, moneda o mostrar_precio; se borra la anterior.
- Borrar propiedad borra toda su carpeta en R2. Quitar una foto borra sus 3 variantes.

Agenda de clientes y Carpeta de pedidos (2026-11-14)

- Tablas privadas (solo admin, nunca el sitio): `clientes`, `cliente_propiedades` (N a N con `rol`
  comprador | propietario; `estado` de seguimiento solo para compradores) y `pedidos` (agenda personal:
  RLS además exige `autor_id = auth.uid()`). SQL: `supabase/migrations/003` y `004`.
- El dueño NO va en `propiedades` (es de lectura pública): va en `cliente_propiedades` con rol propietario.
- Datos opcionales para escritura en `clientes`: DNI/CUIT, nacimiento, nacionalidad, estado civil,
  cónyuge, profesión, domicilio, origen.
- Botones WhatsApp/Llamar con mensaje según rol (`lib/telefono.js` normaliza números argentinos a
  549+área+número; sin característica asume 3456 de Chajarí). Si el número no sirve, solo "Llamar".
- Carpeta: vista lista (Atrasados/Hoy/Próximos/Sin fecha) o calendario mensual; la elección se guarda
  en la cookie `pedidos_vista`. "Hoy" se calcula con zona America/Argentina/Buenos_Aires.
- `<body suppressHydrationWarning>` en el layout raíz por extensiones (ColorZilla) que agregan atributos.

SEO y velocidad (2026-11-14)

- Header: "Sobre nosotros" y "Contacto" son páginas propias (antes anclas de la home).
- Logo del header como `<img>` con `fetchPriority="low"`: React 19 precargaba toda imagen no lazy y
  competía con la imagen LCP. Solo la LCP lleva `priority`.
- Caché de 1 semana para estáticos de /public (logo, íconos, banner, OG, favicon) y headers básicos de
  seguridad en `next.config.mjs` (CSP completa sigue pendiente, fase 8).
- 404 de una propiedad inexistente: código 404 correcto, pero Next 15 (ruta ISR) manda el contenido del 404
  armado en el navegador. No afecta la indexación.

Diseño

- Fondo blanco en toda la web, SIN modo oscuro (se eliminó el theme-toggle).
- Azul de marca #042369 = acción (botones, títulos, links, foco, footer). Verde #27AE47 = detalles
  (líneas, íconos, badges, halos, WhatsApp). Texto verde siempre `--color-accent-text` #1c8237 (AA).
- Estilo "Apple" (skill en `.claude/apple-style/SKILL.md`; para que Claude Code la cargue debe estar en
  `.claude/skills/apple-style/`): vidrio esmerilado en lo que flota, radios amplios, sombras teñidas de
  azul, `--ease-spring`, `:active` con `--press-scale`. Todo movimiento se apaga con reduced-motion.

## 5. Estado por fase

| Fase                       | Estado                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Scaffolding              | Hecha.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2 SQL + clientes           | Hecha: schema.sql ejecutado; `lib/supabase/{server,public,middleware}.js`, `lib/r2.js`, `lib/env.js`, `lib/env-public.js`. `lib/supabase/client.js` sigue stub (no se necesitó).                                                                                                                                                                                                                                                                  |
| 3 Pipeline + actions       | Hecha: `lib/image-pipeline.js`, `lib/og-propiedad.js`, `actions/{properties,images,auth}.js`. `actions/settings.js` y `actions/contact.js` siguen stub.                                                                                                                                                                                                                                                                                           |
| 4 Route Handlers + queries | Parcial: `lib/queries/{properties,admin-properties,categories}.js` hechas. `app/api/*` siguen stub.                                                                                                                                                                                                                                                                                                                                               |
| 5 Layout, tokens, UI       | Hecha: header de vidrio, menú Inmuebles, menú móvil, footer azul, WhatsApp flotante, tokens.                                                                                                                                                                                                                                                                                                                                                      |
| 6 Páginas públicas + SEO   | Hecha: home, `/propiedades`, categorías, detalle, `/sobre-nosotros` y `/contacto` (con mapa diferido), cada una con metadata, canonical y JSON-LD. `sitemap.xml` dinámico (con fotos), `robots.txt`, `manifest.webmanifest`, íconos (favicon, apple-icon, Android 192/512/maskable; `scripts/generate-icons.mjs`), 404 y error propios. Falta: OG estático de respaldo ya cubierto por `og-percara.jpg`.                                          |
| 7 Dashboard                | Casi hecha: login oculto, resumen, listado con filtros y acciones (destacar, publicar, editar, borrar), alta/edición con Zod, gestor de fotos con visor 4:3. `/dashboard/configuracion` (Datos de la inmobiliaria) hecha: edita contacto, oficina y redes de todo el sitio. Agenda de clientes (`/dashboard/clientes`), Carpeta de pedidos (`/dashboard/pedidos`) y "Dueños y compradores" en cada propiedad: hechos, sin probar con sesión real. |
| 8 Migración y lanzamiento  | Pendiente: `scripts/migrate-mysql.js`, redirects 301, headers de seguridad (CSP, etc.), sitemap, checklist Lighthouse.                                                                                                                                                                                                                                                                                                                            |

Probado: build OK; códigos HTTP (404 real, 307 desde el buscador del hero, `/dashboard` -> `/login`);
pipeline de imágenes y OG con `public/banner.webp`. NO probado de punta a punta: login real, CRUD y
subida a R2 (requiere las credenciales del usuario).

## 6. Pendientes del usuario (en orden)

0. Ejecutar `supabase/migrations/005_configuracion_contacto.sql` (sin esto el sitio usa los datos de
   respaldo de `lib/site-config.js` y el panel no puede guardar). 003 y 004 ya se ejecutaron.
   0b. (hecho) `003_clientes_pedidos.sql` y `004_propietarios_datos_cliente.sql`
   (sin esto, Clientes y Carpeta muestran error; el resto del panel sigue andando).
1. Ejecutar `supabase/migrations/002_mostrar_precio.sql` en Supabase. SIN ESTO el sitio y el panel
   fallan al leer propiedades (la columna `mostrar_precio` todavía no existe).
2. Corregir `.env.local`: `NEXT_PUBLIC_SITE_URL=http://localhost:3000` (hoy dice `:300`).
3. Verificar o crear el usuario admin (SQL dado en el chat) y probar: login, crear propiedad, subir
   fotos, cambiar portada, publicar, ver en el sitio, borrar.
4. Opcional: `supabase/seed-demo.sql` (9 propiedades `demo-*`). Borrarlas antes del lanzamiento.
5. ROTAR claves expuestas: secret key de Supabase y token/claves de R2 `percara-web-r2`.
6. Limpiar el final de `supabase/schema.sql`: tiene pegadas líneas de PowerShell (`'@ | Set-Content ...`).
7. ESLint roto: `eslint.config.mjs` usa el formato de Next 16 (`eslint-config-next/core-web-vitals`)
   con el paquete de Next 15. `npm run lint` falla; el build sí pasa.
8. Banner del hero (`public/banner.webp`, 1024x434): trae texto incrustado y la dirección
   "Rivadavia 3935"; el sitio usa "Salvarredy 1919" (editable en /dashboard/configuracion). Confirmar la dirección
   correcta y conseguir una foto de 1600 px o más, sin texto.
9. Mover la skill a `.claude/skills/apple-style/SKILL.md`.
10. Confirmar con el cliente si quieren cantidad de cocheras (hoy Sí/No) y "estado de conservación".

## 7. Mapa de archivos clave

- Datos de contacto: tabla `configuracion` (fila única), editable en `/dashboard/configuracion`.
  Sitio: `getContacto()` en `lib/queries/settings.js` (cacheada con tag `propiedades`) + `lib/contacto.js`
  (normaliza y arma links). Respaldo si la base falla: `lib/site-config.js` (CONTACTO_RESPALDO).
- Categorías: `lib/queries/categories.js` (seed estático) + `lib/categories-meta.js` (ícono y bajada).
- SEO: `lib/seo.js` (pageMetadata, metadataPropiedad, JSON-LD). Formato: `lib/format.js`.
- Esquemas Zod: `lib/schemas/{auth,propiedad}.js`; etiquetas para el cliente en `propiedad-etiquetas.js`.
- Seguridad: `lib/auth.js` (getAdmin, requireAdmin, assertAdmin), `lib/rate-limit.js` (en memoria, por
  instancia: en Vercel con varias instancias no es global).
- SQL: `supabase/schema.sql`, `supabase/migrations/002_mostrar_precio.sql`, `supabase/seed-demo.sql`.

## 8. Infraestructura

- Supabase: proyecto `eyqrickfyrxgjsaqyubz`, us-east-1. Claves nuevas publishable/secret (nombres de
  variable `..._ANON_KEY` y `..._SERVICE_ROLE_KEY`). Registro público de Auth DESACTIVADO.
- R2: bucket `percara-media` (ENAM). Dev: `https://pub-8a07b2867efd49a5b0e0cbac329a91c1.r2.dev`. En
  producción usar dominio propio (ej. `cdn.inmobiliariapercara.com`) y actualizar `R2_PUBLIC_URL`.
- Variables en `.env.local` (ignorado); `.env.example` aparece borrado en git: restaurarlo (la spec pide
  versionarlo).

## 9. Preferencias de trabajo del usuario

- Full stack senior. Respuestas en español, breves, sin introducciones ni despedidas.
- Por fases: plan corto, esperar OK, al terminar lista de archivos + build, y detenerse.
- NO commitear ni pushear salvo que el usuario lo pida (2026-11-14). No correr sus comandos pegados.
- Compilar de prueba con `NEXT_DIST_DIR=.next-prueba` para no pisar el `.next` de su `npm run dev`.
- No inventar datos de contacto ni contenido: dejar TODO y preguntar.
- Usa Windows; a veces corre comandos en CMD en vez de PowerShell: dar comandos de PowerShell.

<!-- RESUMEN
   Traspaso único y actualizado del proyecto: stack real, decisiones tomadas (rutas, seguridad, negocio,
   imágenes, diseño), estado por fase, pendientes del usuario, mapa de archivos e infraestructura.
   Lo importa CLAUDE.md. -->
