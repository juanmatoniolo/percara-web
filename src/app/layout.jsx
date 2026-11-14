// src/app/layout.jsx
import { Lato, Montserrat } from 'next/font/google';
import { siteMetadata, siteViewport } from '@/lib/seo';
import '@/styles/tokens.css';
import '@/styles/animations.css';
import './globals.css';

const display = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = siteMetadata;
export const viewport = siteViewport;

export default function RootLayout({ children }) {
  return (
    <html
      lang="es-AR"
      className={`${display.variable} ${body.variable}`}
      data-scroll-behavior="smooth"
    >
      {/* suppressHydrationWarning: extensiones (ColorZilla, Grammarly...) agregan atributos al <body>
          antes de que cargue React. Solo ignora atributos de esta etiqueta, no de sus hijos. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

/* RESUMEN
   Layout raíz (Server Component). Carga Montserrat (títulos) y Lato (cuerpo) con next/font, estilos
   globales y metadata. Tema único claro (sin modo oscuro ni JS de tema). Marca el scroll suave
   para anclas (data-scroll-behavior); ignora atributos que agregan extensiones al <body>. Recibe `children`; renderiza <html lang="es-AR">.
   Depende de: lib/seo.js, styles/tokens.css, styles/animations.css, app/globals.css */
