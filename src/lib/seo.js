// src/lib/seo.js
import { CONTACT } from '@/lib/site-config';

/* URL absoluta del sitio para canonical y og:image (WhatsApp exige URLs absolutas y accesibles).
   Si la variable apunta a localhost estando en Vercel, se usa el dominio del proyecto en Vercel. */
function resolverSiteUrl() {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (env && !(vercel && /localhost|127\.0\.0\.1/.test(env))) return env.replace(/\/$/, '');
  if (vercel) return `https://${vercel}`;
  return 'https://inmobiliariapercara.com';
}

export const SITE_URL = resolverSiteUrl();
export const SITE_NAME = 'Inmobiliaria Percara';

/** Imagen para compartir del sitio (generada desde public/logo.png con scripts/generate-og-default.mjs). */
export const OG_SITIO = {
  url: '/og-percara.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'Percara Negocios Inmobiliarios, Chajarí',
};
const DEFAULT_TITLE = 'Casas, Campos y Terrenos en Venta en Chajarí | Inmobiliaria Percara';
const DEFAULT_DESCRIPTION =
  'Compra y venta de casas, campos y terrenos en Chajarí y la región. Encuentre su propiedad ideal con asesoramiento personalizado.';

export const siteMetadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  robots: { index: true, follow: true },
  verification: { google: 'meP8QjZrYsX5mdA_ItrEyTV8H3ajxH4PCiKX8Q7dk4w' },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: '/',
    images: [OG_SITIO],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_SITIO],
  },
};

export const siteViewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  images = [OG_SITIO],
} = {}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const social = { title: fullTitle, description, images };
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', locale: 'es_AR', siteName: SITE_NAME, url: path, ...social },
    twitter: { card: 'summary_large_image', ...social },
  };
}

export function jsonLdInmobiliaria() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Percara Negocios Inmobiliarios',
    url: SITE_URL,
    telephone: CONTACT.telefonoE164,
    email: CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Salvarredy 1919',
      addressLocality: 'Chajarí',
      addressRegion: 'Entre Ríos',
      addressCountry: 'AR',
    },
    areaServed: 'Chajarí, Entre Ríos, Argentina',
    sameAs: [CONTACT.instagram, CONTACT.facebook],
  };
}

/**
 * Metadata completa de una propiedad: title y description con sus datos (precio, superficie,
 * dormitorios, localidad), canonical, Open Graph y Twitter con la OG precalculada (1200x630).
 * @param {import('@/types').Propiedad} p
 * @param {{ precio: string, datos: string[], descripcion: string }} textos  ya formateados
 */
export function metadataPropiedad(p, { precio, datos, descripcion }) {
  const path = `/propiedades/${p.slug}`;
  /* Sin OG precalculada (todavía sin fotos) se usa la del sitio: nunca WebP, que WhatsApp no siempre muestra */
  const imagen = p.og_image_url
    ? { url: p.og_image_url, width: 1200, height: 630, type: 'image/jpeg', alt: p.titulo }
    : OG_SITIO;
  const description = [`${precio}.`, datos.join(' · ') + (datos.length ? '.' : ''), descripcion]
    .filter(Boolean)
    .join(' ')
    .slice(0, 300);

  return {
    ...pageMetadata({ title: `${p.titulo} | ${precio}`, description, path, images: [imagen] }),
    robots: { index: p.estado === 'publicada', follow: true },
  };
}

/**
 * BreadcrumbList a partir de [{ nombre, path }].
 * @param {{ nombre: string, path: string }[]} items
 */
export function jsonLdBreadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.nombre,
      item: new URL(it.path, SITE_URL).toString(),
    })),
  };
}

/**
 * RealEstateListing + Offer de una propiedad.
 * @param {import('@/types').Propiedad} p
 */
export function jsonLdPropiedad(p) {
  const url = new URL(`/propiedades/${p.slug}`, SITE_URL).toString();
  const imagenes = p.imagenes.map((img) => new URL(img.url, SITE_URL).toString());
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: p.titulo,
    url,
    description: p.descripcion ?? undefined,
    datePosted: p.created_at,
    dateModified: p.updated_at,
    ...(imagenes.length ? { image: imagenes } : {}),
    about: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: p.direccion ?? undefined,
        addressLocality: p.localidad ?? 'Chajarí',
        addressRegion: 'Entre Ríos',
        addressCountry: 'AR',
      },
      ...(p.lat && p.lng
        ? { geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng } }
        : {}),
    },
    offers: {
      '@type': 'Offer',
      url,
      businessFunction: 'http://purl.org/goodrelations/v1#Sell',
      availability:
        p.estado === 'vendida' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      ...(p.precio && p.mostrar_precio !== false
        ? { price: p.precio, priceCurrency: p.moneda }
        : {}),
      seller: { '@type': 'RealEstateAgent', name: 'Percara Negocios Inmobiliarios', url: SITE_URL },
    },
  };
}

export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/* RESUMEN
   Metadata global (title con plantilla, robots, verificación de Search Console), viewport con
   themeColor, helper pageMetadata() con canonical/OpenGraph/Twitter por página y JSON-LD: sitio
   (RealEstateAgent), jsonLdBreadcrumb(items) y jsonLdPropiedad(p) (RealEstateListing + Offer).
   metadataPropiedad(p, textos) arma la metadata del detalle; OG_SITIO (public/og-percara.jpg) es la
   imagen por defecto al compartir. Depende de: lib/site-config.js, NEXT_PUBLIC_SITE_URL / VERCEL_* */
