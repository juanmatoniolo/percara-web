// src/components/admin/delete-button.jsx
'use client';

import { Trash2 } from 'lucide-react';
import { borrarPropiedad } from '@/actions/properties';

/**
 * Botón de borrado con confirmación nativa. Client Component: necesita confirm() antes de enviar.
 * @param {{ id: string, titulo: string, className?: string }} props
 */
export default function DeleteButton({ id, titulo, className }) {
  function confirmar(e) {
    if (!window.confirm(`¿Borrar "${titulo}"? Esta acción no se puede deshacer.`))
      e.preventDefault();
  }

  return (
    <form action={borrarPropiedad} onSubmit={confirmar}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className} aria-label={`Borrar ${titulo}`} title="Borrar">
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </form>
  );
}

/* RESUMEN
   Botón de borrar propiedad (Client Component mínimo): pide confirmación con window.confirm y envía la
   Server Action borrarPropiedad (que verifica admin). Recibe `id`, `titulo`, `className`.
   Depende de: actions/properties.js, lucide-react */
