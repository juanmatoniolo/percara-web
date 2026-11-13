// src/components/admin/estado-badge.jsx
import styles from './estado-badge.module.css';

const TEXTOS = { publicada: 'Publicada', borrador: 'Borrador', vendida: 'Vendida' };

/** @param {{ estado: 'borrador' | 'publicada' | 'vendida' }} props */
export default function EstadoBadge({ estado }) {
  return (
    <span className={styles.badge} data-estado={estado}>
      {TEXTOS[estado] ?? estado}
    </span>
  );
}

/* RESUMEN
   Píldora de estado de una propiedad (Server Component): publicada (verde), borrador (ámbar),
   vendida (azul). Recibe `estado`. Depende de: estado-badge.module.css */
