// src/app/robots.js
import { SITE_URL } from '@/lib/seo';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/login', '/api/'] },
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
  };
}

/* RESUMEN
   robots.txt: permite todo el sitio público y bloquea el panel, el login oculto y la API; declara el
   sitemap. Depende de: lib/seo.js (SITE_URL) */
