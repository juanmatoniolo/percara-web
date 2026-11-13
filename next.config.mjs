// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;

/* RESUMEN
   Configuración de Next: loader propio de imágenes (variantes pregeneradas en R2), límite de 12 MB para
   Server Actions (subida de fotos) e inclusión de la fuente Montserrat en el bundle del panel (OG).
   Headers de seguridad y redirects 301 llegan en la fase 8. Depende de: src/lib/image-loader.js */
