// src/app/manifest.js

/** Manifest web: permite "Agregar a la pantalla de inicio" en Android con ícono y nombre propios. */
export default function manifest() {
  return {
    name: 'Percara Negocios Inmobiliarios',
    short_name: 'Percara',
    description: 'Casas, campos y terrenos en venta en Chajarí, Entre Ríos.',
    lang: 'es-AR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

/* RESUMEN
   /manifest.webmanifest (convención de Next): nombre, colores, idioma y los íconos de Android (192, 512
   y maskable). Depende de: public/icons/* (scripts/generate-icons.mjs) */
