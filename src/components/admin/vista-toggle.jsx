// src/components/admin/vista-toggle.jsx
import { CalendarDays, List } from 'lucide-react';
import { elegirVista } from '@/actions/pedidos';
import styles from './vista-toggle.module.css';

const VISTAS = [
  { valor: 'lista', texto: 'Lista', Icono: List },
  { valor: 'calendario', texto: 'Calendario', Icono: CalendarDays },
];

/**
 * Selector Lista / Calendario. Un form con dos botones: la Server Action guarda la elección en una
 * cookie (se recuerda la próxima vez) y abre esa vista. Funciona sin JS.
 * @param {{ vista: 'lista' | 'calendario', mes?: string }} props
 */
export default function VistaToggle({ vista, mes }) {
  return (
    <form action={elegirVista} className={styles.toggle} aria-label="Cambiar vista">
      {mes && <input type="hidden" name="mes" value={mes} />}
      {VISTAS.map(({ valor, texto, Icono }) => (
        <button
          key={valor}
          type="submit"
          name="vista"
          value={valor}
          className={styles.opt}
          aria-pressed={vista === valor}
        >
          <Icono size={18} aria-hidden="true" />
          {texto}
        </button>
      ))}
    </form>
  );
}

/* RESUMEN
   Control segmentado Lista / Calendario (Server Component): form con dos botones que envían elegirVista
   (cookie + redirección). Recibe `vista` actual y `mes`. Depende de: actions/pedidos.js, module.css */
