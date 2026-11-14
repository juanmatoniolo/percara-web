// src/components/admin/tag.jsx
import styles from './tag.module.css';

/**
 * Etiqueta chica de color (rol, seguimiento, prioridad, estado).
 * @param {{ tono?: 'verde' | 'azul' | 'ambar' | 'rojo' | 'gris', children: import('react').ReactNode }} props
 */
export default function Tag({ tono = 'gris', children }) {
  return (
    <span className={styles.tag} data-tono={tono}>
      {children}
    </span>
  );
}

/** Tono de cada valor de la agenda, para usar con <Tag>. */
export const TONOS = {
  propietario: 'azul',
  comprador: 'verde',
  interesado: 'verde',
  visita_agendada: 'ambar',
  visito: 'azul',
  oferto: 'azul',
  descartada: 'gris',
  alta: 'rojo',
  normal: 'gris',
  baja: 'gris',
  pendiente: 'ambar',
  hecho: 'verde',
  cancelado: 'gris',
};

/* RESUMEN
   Píldora de color (Server Component) para roles, seguimiento, prioridad y estado de pedidos, y el mapa
   TONOS valor -> color. Recibe `tono` y `children`. Depende de: tag.module.css */
