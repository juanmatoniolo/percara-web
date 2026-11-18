// src/components/admin/visibilidad-vendida.jsx
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { renovarVendida } from '@/actions/properties';
import { plural } from '@/lib/format';
import styles from './visibilidad-vendida.module.css';

/** Días enteros que faltan hasta `hasta` (0 o menos = ya no se ve). */
function diasRestantes(hasta) {
  if (!hasta) return 0;
  return Math.ceil((new Date(hasta).getTime() - Date.now()) / 864e5);
}

/**
 * Cuánto tiempo más se ve una vendida en el sitio y botón para renovar 60 días.
 * Solo se muestra si la propiedad está vendida.
 * @param {{ propiedad: { id: string, estado: string, vendida_hasta?: string | null }, compacto?: boolean }} props
 */
export default function VisibilidadVendida({ propiedad: p, compacto = false }) {
  if (p.estado !== 'vendida') return null;
  const dias = diasRestantes(p.vendida_hasta);
  const visible = dias > 0;

  return (
    <div
      className={styles.box}
      data-visible={visible || undefined}
      data-compacto={compacto || undefined}
    >
      <p className={styles.texto}>
        {visible ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
        {visible
          ? `Visible en el sitio ${plural(dias, 'día', 'días')} más`
          : 'Ya no se ve en el sitio'}
      </p>
      <form action={renovarVendida}>
        <input type="hidden" name="id" value={p.id} />
        <button type="submit" className={styles.renovar}>
          <RefreshCw size={16} aria-hidden="true" />
          Renovar 60 días
        </button>
      </form>
    </div>
  );
}

/* RESUMEN
   Visibilidad de una propiedad vendida en el panel (Server Component): días que le quedan en el sitio
   (o "Ya no se ve") y botón "Renovar 60 días" (Server Action). Recibe `propiedad` y `compacto`.
   Depende de: actions/properties.js (renovarVendida), lib/format.js, visibilidad-vendida.module.css */
