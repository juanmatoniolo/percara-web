# TRASPASO DE CONTEXTO: Percara Negocios Inmobiliarios

Actualizado: 2026-11-17 (último commit 4045b07 + header del sitio en /login). Fuente única del estado del proyecto (antes estaba duplicado al final de
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

Recordatorios (2026-11-16)

- Solapa `/dashboard/recordatorios`: cada negocio cerrado con cliente, propiedad, forma de pago (contado,
  financiado, cuotas con el vendedor, permuta, mixto), medio (efectivo, transferencia, cheque...), moneda,
  total, anticipo, cuotas (cantidad, monto, moneda propia, primer vencimiento mensual), estado y
  observaciones libres. Próxima cuota calculada en `lib/cuotas.js`. Tabla compartida entre admins.
  SQL: `supabase/migrations/007_recordatorios.sql`. Acceso "Registrar negocio" desde cada propiedad.
  `/dashboard/recordatorios/[id]` es la vista (solo lectura, con calendario de cuotas y saldo) y
  `/[id]/editar` el formulario; guardar vuelve a la vista.

Listado y panel (2026-11-16)

- Listados públicos paginados (24 por página, `lib/listado.js`) con filtro `?localidad=` (solo localidades
  con publicadas; lista blanca). Página fuera de rango muestra el estado vacío (notFound ahí daba 200 por streaming). Canonical sin parámetros.
- Localidad obligatoria al cargar una propiedad, con sugerencias de las ya cargadas (datalist).
- Botón "Agendar cita" en `/dashboard/propiedades/[id]`: abre un pedido nuevo de la Carpeta con la
  propiedad y el título "Visita: ..." precargados.
- Borrados: stubs `api/{propiedades,categorias}`, `actions/contact.js`, `supabase/client.js`,
  `seed-demo.sql`, scripts `check-r2`, `extract-styles` y de migración.

SEO y velocidad (2026-11-14)

- Panel en móvil (2026-11-17): la fila de marca/"Nueva"/salir se va con el scroll y solo queda fija una
  fila fina (54 px) de solapas deslizables (textos cortos "Pedidos" y "Datos" bajo 480 px; la activa se
  centra sola con `NavLink alVista`). `.bar`/`.top` usan `display: contents` en móvil para que el sticky
  sea relativo a toda la página. Desde 1024 px, barra lateral igual que antes.
- Galería del detalle: carrusel renderizado en servidor (LCP intacta) + `gallery-controls.jsx` (cliente):
  flechas de vidrio solo con mouse, tira de miniaturas (variante 400) y teclado ← →. En celular se desliza.
- Botón "Ver en Google Maps" en la tarjeta del detalle (2026-11-17): Maps URLs `search/?api=1&query=lat,lng`
  (sin API key), solo si lat/lng son válidas y no 0,0 (146 de 152 lo tienen).
- Clientes (2026-11-17): se quitó la sección "Qué busca" del formulario de cliente (las columnas viejas
  siguen en `clientes`, sin datos, y no se tocan). Ahora vive en la Carpeta: cada pedido tiene "Qué busca
  (opcional)" con tipo (`categoria_id`), `presupuesto` y `moneda`; el detalle es "en sus palabras" y el
  pedido muestra "Busca: Casas · hasta USD 50.000". SQL en migración 008.
- Provincia / localidad / barrio y filtros (2026-11-18): columnas `provincia` (lista cerrada en
  `lib/lugares.js`) y `barrio` (migración 009, que además unifica "Juan Pujol Corrientes" y "Saenz Valiente",
  asigna provincia por coordenadas y carga barrios Las 14, Tagüé y Citrícola). Panel: `lugar-select.jsx`
  encadena provincia > localidad > barrio con lo ya cargado + "Agregar nueva…"; `unificarLugar` en
  `actions/properties.js` reutiliza la forma existente sin tildes/mayúsculas (no conviven "Chajari" y
  "Chajarí"). Sitio (2026-11-18, revisado): `filtros-listado.jsx` (cliente; sin JS es un GET) en cascada
  provincia > ciudad > barrio: cada nivel aparece al elegir el anterior y solo ofrece lo que existe
  (`getLugares` arma el árbol con cantidades; "Sin barrio asignado" = `?barrio=sin-asignar`), más "solo con
  precio publicado". Se quitó el rango de precio. Sin la 009 arranca directo por ciudad. Pestañas de
  categorías siempre en una fila (sin íconos desde 1024 px, nombres cortos). Botón flotante de WhatsApp
  con "x" (`whatsapp-float-cerrable.jsx`, oculto durante la visita vía sessionStorage). Pendiente confirmar: "Corrientes" (Paraje Piedritas) y "Departamento
  Curuzú" (San Jaime).
- Alta con fotos en un solo paso (2026-11-17): en "Nueva propiedad" las fotos se recortan y quedan en el
  navegador (`fotos-nuevas.jsx`); al crear, `guardarPropiedad` devuelve `{ ok, id }` (ya no redirige en
  el alta), `lib/subir-fotos.js` las sube de a una con `subirImagen` mostrando el progreso y se abre la
  edición con `?aviso=creada&fotos=N&fallidas=M`.
- Vendidas visibles 60 días (2026-11-17): `propiedades.vendida_hasta` + trigger (pasar a vendida = hoy +
  60 días; otro estado = null) + RLS pública `publicada OR (vendida AND vendida_hasta > now())`: al vencer
  desaparecen solas (con hasta 1 h de ISR). Las queries públicas usan `.in('estado', VISIBLES)` y ordenan
  por estado (vendidas al final); la home (destacadas) usa `soloDisponibles`. `precioPublico` devuelve
  "Vendida". Card con banda azul "Vendida" y foto atenuada (`--vendida-filtro`); detalle con chip, aviso
  y WhatsApp "Consultar por similares"; indexables y en el sitemap mientras se ven. Panel:
  `visibilidad-vendida.jsx` (días restantes + "Renovar 60 días" -> `renovarVendida`) en la lista y la
  edición.
- Home, texto de "¿Por qué elegirnos?": nombra campos, quintas, forestaciones, casas, terrenos,
  departamentos y locales comerciales (pedido del cliente), cada uno con enlace a su categoría.
- `/login` muestra el header del sitio (`SiteHeader`) para volver al inicio con un clic; sigue sin haber
  links del sitio hacia el login.
- Header: "Sobre nosotros" y "Contacto" son páginas propias (antes anclas de la home).
- Logo del header como `<img>` con `fetchPriority="low"`: React 19 precargaba toda imagen no lazy y
  competía con la imagen LCP. Solo la LCP lleva `priority`.
- Caché de 1 semana para estáticos de /public (logo, íconos, banner, OG, favicon) y headers básicos de
  seguridad en `next.config.mjs` (CSP completa sigue pendiente, fase 8).
- 404 de una propiedad inexistente: código 404 correcto, pero Next 15 (ruta ISR) manda el contenido del 404
  armado en el navegador. No afecta la indexación. Por eso `not-found.jsx` es mínimo (2026-11-17): solo
  "Error 404" + "Volver al inicio", sin header ni footer (sus estilos no llegaban y se veía mezclado).

Diseño

- Fondo blanco en toda la web, SIN modo oscuro (se eliminó el theme-toggle).
- Azul de marca #042369 = acción (botones, títulos, links, foco, footer). Verde #27AE47 = detalles
  (líneas, íconos, badges, halos, WhatsApp). Texto verde siempre `--color-accent-text` #1c8237 (AA).
- Estilo "Apple" (skill en `.claude/skills/apple-style/SKILL.md`, la carga Claude Code): vidrio esmerilado en lo que flota, radios amplios, sombras teñidas de
  azul, `--ease-spring`, `:active` con `--press-scale`. Todo movimiento se apaga con reduced-motion.

## 5. Estado por fase

| Fase                       | Estado                                                                                                                                                                                                                                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Scaffolding              | Hecha.                                                                                                                                                                                                                                                                                                                       |
| 2 SQL + clientes           | Hecha: `schema.sql` y migraciones 002 a 007 EJECUTADAS (verificado 2026-11-16). `lib/supabase/{server,public,middleware}.js`, `lib/r2.js`, `lib/env.js`, `lib/env-public.js`.                                                                                                                                                |
| 3 Pipeline + actions       | Hecha: `lib/image-pipeline.js` (WebP q76, effort 6, smartSubsample), `lib/og-propiedad.js`, `actions/{properties,images,auth,settings,clientes,pedidos,recordatorios}.js`. Sin formulario de contacto (se contacta por WhatsApp).                                                                                            |
| 4 Route Handlers + queries | Queries hechas en `lib/queries/*`. Los stubs de `app/api/*` se borraron: no se usan (todo es Server Components).                                                                                                                                                                                                             |
| 5 Layout, tokens, UI       | Hecha: header de vidrio, menú Inmuebles, menú móvil, footer azul, WhatsApp flotante, tokens, skeletons de carga y `LinkPending` (`useLinkStatus`).                                                                                                                                                                           |
| 6 Páginas públicas + SEO   | Hecha: home, `/propiedades` (grupo `(listado)` con loading propio), categorías (layout que valida antes del loading = 404 real), detalle, `/sobre-nosotros`, `/contacto`, metadata, canonical, JSON-LD, sitemap con fotos, robots, manifest, íconos, 404 y error propios. Responsive verificado 320 a 1440 px.               |
| 7 Dashboard                | Hecha: login oculto, resumen, propiedades (CRUD, fotos con visor 4:3, medidas, localidad obligatoria con sugerencias, "Agendar cita", "Registrar negocio"), configuración, Clientes, Carpeta de pedidos, Recordatorios (listado, vista, edición). Sin prueba automatizada con sesión real (el usuario la usa en producción). |
| 8 Migración y lanzamiento  | Migración HECHA: 152 propiedades publicadas, 384 fotos en R2; `id_viejo`/`slug_viejo` en la tabla; mapa en `docs/redirecciones-301.json`. Scripts de migración borrados (nunca versionados; el dump vive en `migracion-datos/`, ignorado). Falta: 301, CSP completa, Lighthouse.                                             |

Probado (2026-11-16): lint (0 errores) y build; producción con códigos HTTP correctos (404 real en
categoría y propiedad inexistentes), sitemap de 165 URLs, TTFB 0,35 a 1 s; HTML 20-32 KB gzip, JS ~156 KB.
Sin desborde horizontal en páginas públicas a 320/375/768/1024/1440 (script CDP con Chrome headless).
Lighthouse por `npx` lo bloquea el clasificador de permisos y la API de PageSpeed dio cuota agotada:
medir a mano en pagespeed.web.dev.

## 6. Pendientes (en orden)

1. Redirecciones 301: falta que el usuario pase una URL de propiedad del sitio viejo (patrón de ruta) para
   armar `redirects()` en `next.config.mjs` con `docs/redirecciones-301.json`.
2. Corregir localidades mal cargadas desde el panel: "Corrientes", "Juan Pujol Corrientes",
   "Departamento Curuzú", "Saenz Valiente" (unificar nombres; el filtro las lista tal cual).
3. ROTAR claves expuestas antes: secret key de Supabase y token/claves de R2 `percara-web-r2`.
4. Dominio propio para R2 (`r2.dev` tiene límite de tasa) y actualizar `R2_PUBLIC_URL` (y `remotePatterns`).
5. En Vercel: `NEXT_PUBLIC_SITE_URL=https://inmobiliariapercara.com`.
6. CSP completa en `next.config.mjs` y checklist Lighthouse >= 95 (fase 8).
7. Banner del hero (`public/banner.webp`, 1024x434) trae texto y "Rivadavia 3935"; el sitio usa
   "Salvarredy 1919" (editable en /dashboard/configuracion). Confirmar dirección y conseguir foto >= 1600 px sin texto.
8. Confirmar con el cliente: cantidad de cocheras (hoy Sí/No) y "estado de conservación".
9. ISR: propiedades publicadas por script no revalidan ISR hasta 1 h; si se cambia algo
   por SQL directo, guardar cualquier propiedad en el panel para forzar `revalidateTag`.

## 7. Mapa de archivos clave

- Datos de contacto: tabla `configuracion` (fila única), editable en `/dashboard/configuracion`.
  Sitio: `getContacto()` en `lib/queries/settings.js` (cacheada con tag `propiedades`) + `lib/contacto.js`
  (normaliza y arma links). Respaldo si la base falla: `lib/site-config.js` (CONTACTO_RESPALDO).
- Categorías: `lib/queries/categories.js` (seed estático) + `lib/categories-meta.js` (ícono y bajada).
- Listados: `lib/queries/properties.js` (`getPropiedades` con count + range, `getLocalidades`),
  `lib/listado.js` (POR_PAGINA 24, `leerFiltros`, `urlListado`), `components/property/{listing-view,
localidad-filter,paginacion,listing-skeleton,category-tabs}.jsx`.
- Imágenes: `lib/image-pipeline.js` (variantes) y `lib/image-loader.js` (loaderFile; tolerancia 1.35 para
  elegir 400/900/1600, en celular baja la de 900).
- SEO: `lib/seo.js` (pageMetadata, metadataPropiedad, JSON-LD). Formato: `lib/format.js` (incluye `formatMedidas`).
- Esquemas Zod: `lib/schemas/{auth,propiedad,cliente,pedido,recordatorio,campos}.js`; etiquetas en
  `*-etiquetas.js`.
- Panel: queries `lib/queries/admin-{properties,clientes,pedidos,recordatorios}.js`; fechas en zona AR
  `lib/fechas.js`; cuotas `lib/cuotas.js` (`proximaCuota`, `calendarioCuotas`); teléfonos `lib/telefono.js`.
- Seguridad: `lib/auth.js` (getAdmin, requireAdmin, assertAdmin), `lib/rate-limit.js` (en memoria, por
  instancia: en Vercel con varias instancias no es global).
- SQL: `supabase/schema.sql`, `supabase/migrations/002` a `008` (ejecutadas; 008 verificada 2026-11-18) y
  `009_provincia_barrio.sql` (PENDIENTE al 2026-11-18; sin ella todo funciona sin barrio/provincia). Sin ella el panel funciona igual: `listarPropiedadesAdmin` y
  `admin-pedidos` reintentan sin las columnas nuevas (códigos 42703 / PGRST200) y `guardarPedido` guarda
  sin "qué busca" (PGRST204); vendidas y "qué busca" se activan solas al correrla.

## 8. Infraestructura

- Supabase: proyecto `eyqrickfyrxgjsaqyubz`, us-east-1. Claves nuevas publishable/secret (nombres de
  variable `..._ANON_KEY` y `..._SERVICE_ROLE_KEY`). Registro público de Auth DESACTIVADO.
- R2: bucket `percara-media` (ENAM). Dev: `https://pub-8a07b2867efd49a5b0e0cbac329a91c1.r2.dev`. En
  producción usar dominio propio (ej. `cdn.inmobiliariapercara.com`) y actualizar `R2_PUBLIC_URL`.
- Variables en `.env.local` (ignorado); `.env.example` versionado sin valores (restaurado 2026-11-16, sin
  las MYSQL_*). Auditado: secretos solo en `lib/env.js` y `lib/r2.js` (server-only), ningún secreto en el
  bundle del cliente.
- Responsive (2026-11-16): páginas públicas probadas sin desborde horizontal en 320/375/768/1024/1440.
  Fix: `.list` de category-tabs con `position: relative` (los `.sr-only` absolutos ensanchaban la página).

## 9. Preferencias de trabajo del usuario

- Full stack senior. Respuestas en español, breves, sin introducciones ni despedidas.
- Por fases: plan corto, esperar OK, al terminar lista de archivos + build, y detenerse.
- NO commitear ni pushear salvo que el usuario lo pida (2026-11-14). Cuando lo pide: lint + build +
  revisar secretos, Conventional Commits; el pre-commit corre eslint y prettier. No correr sus comandos pegados.
- Compilar de prueba con `NEXT_DIST_DIR=.next-prueba` para no pisar el `.next` de su `npm run dev`.
- No inventar datos de contacto ni contenido: dejar TODO y preguntar.
- Usa Windows; a veces corre comandos en CMD en vez de PowerShell: dar comandos de PowerShell.

<!-- RESUMEN
   Traspaso único y actualizado del proyecto: stack real, decisiones tomadas (rutas, seguridad, negocio,
   imágenes, diseño), estado por fase, pendientes del usuario, mapa de archivos e infraestructura.
   Lo importa CLAUDE.md. -->
