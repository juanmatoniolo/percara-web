// src/app/sitemap.js
import { CATEGORIAS } from '@/lib/queries/categories';
import { getPropiedadesSitemap } from '@/lib/queries/properties';
import { SITE_URL } from '@/lib/seo';

/* Se regenera con las propiedades (tag 'propiedades') y como máximo cada hora */
export const revalidate = 3600;

const abs = (path) => new URL(path, SITE_URL).toString();

/** sitemap.xml dinámico: páginas fijas, las 9 categorías y cada propiedad publicada con sus fotos. */
export default async function sitemap() {
  const propiedades = await getPropiedadesSitemap();
  const ultima = propiedades[0]?.updated_at ? new Date(propiedades[0].updated_at) : new Date();

  const fijas = [
    { url: abs('/'), lastModified: ultima, changeFrequency: 'daily', priority: 1 },
    { url: abs('/propiedades'), lastModified: ultima, changeFrequency: 'daily', priority: 0.9 },
    { url: abs('/sobre-nosotros'), changeFrequency: 'yearly', priority: 0.5 },
    { url: abs('/contacto'), changeFrequency: 'yearly', priority: 0.6 },
  ];

  const categorias = CATEGORIAS.map(({ slug }) => ({
    url: abs(`/categorias/${slug}`),
    lastModified: ultima,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const fichas = propiedades.map((p) => ({
    url: abs(`/propiedades/${p.slug}`),
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
    /* Hasta 10 fotos por ficha: ayuda a aparecer en Google Imágenes */
    images: (Array.isArray(p.imagenes) ? p.imagenes : []).slice(0, 10).map((img) => abs(img.url)),
  }));

  return [...fijas, ...categorias, ...fichas];
}

/* RESUMEN
   sitemap.xml dinámico (ISR 1 h + tag 'propiedades'): home, /propiedades, /sobre-nosotros, /contacto,
   las 9 categorías y cada propiedad publicada con fecha de modificación y fotos.
   Depende de: lib/queries/{categories,properties}.js, lib/seo.js (SITE_URL) */
