// src/app/(public)/template.jsx

/**
 * Template del sitio público: a diferencia del layout, se vuelve a montar en cada navegación,
 * lo que dispara la animación CSS .page-enter (fundido + leve subida) al cambiar de página.
 * @param {{ children: import('react').ReactNode }} props
 */
export default function PublicTemplate({ children }) {
  return <div className="page-enter">{children}</div>;
}

/* RESUMEN
   Template público (Server Component). Envuelve cada página en .page-enter para una transición
   suave al navegar, sin JS extra. Recibe `children`.
   Depende de: styles/animations.css */
