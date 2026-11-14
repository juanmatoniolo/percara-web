// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* NEXT_DIST_DIR permite compilar de prueba sin pisar el .next de `npm run dev` (Vercel usa .next) */
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    /* Las variantes 400/900/1600 se generan al subir (Sharp): el loader elige la adecuada */
    loader: 'custom',
    loaderFile: './src/lib/image-loader.js',
  },
  experimental: {
    /* Cada foto recortada viaja sola (máx. 10 MB validado en servidor) + margen del FormData */
    serverActions: { bodySizeLimit: '12mb' },
  },
  /* La fuente de la imagen OG se lee del disco en el servidor: incluirla en el bundle de las rutas del panel */
  outputFileTracingIncludes: {
    '/dashboard/**': ['./src/assets/fonts/**'],
  },
  async headers() {
    /* Archivos de /public (logo, íconos, banner, OG): caché de 1 semana en el navegador y la CDN.
       Next los sirve con max-age=0 por defecto, lo que fuerza a revalidarlos en cada visita. */
    const cacheEstaticos = {
      key: 'Cache-Control',
      value: 'public, max-age=604800, stale-while-revalidate=86400',
    };
    return [
      ...['/logo-percara.webp', '/og-percara.jpg', '/banner.webp', '/favicon.ico'].map(
        (source) => ({
          source,
          headers: [cacheEstaticos],
        }),
      ),
      { source: '/icons/:path*', headers: [cacheEstaticos] },
      {
        /* Seguridad básica en todo el sitio (la CSP completa queda para la fase 8) */
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;

/* RESUMEN
   Configuración de Next: loader propio de imágenes (variantes pregeneradas en R2), límite de 12 MB para
   Server Actions (subida de fotos) e inclusión de la fuente Montserrat en el bundle del panel (OG). distDir configurable (NEXT_DIST_DIR).
   Caché de 1 semana para los estáticos de /public y headers de seguridad básicos (CSP y redirects 301
   en la fase 8). Depende de: src/lib/image-loader.js */
