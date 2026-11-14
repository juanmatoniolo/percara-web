// src/components/admin/confirm-form.jsx
'use client';

/**
 * Form de una Server Action que pide confirmación antes de enviarse (borrar, quitar vínculo).
 * Client Component mínimo: solo necesita window.confirm.
 * @param {{
 *   action: (formData: FormData) => any, campos: Record<string, string>, mensaje: string,
 *   className?: string, etiqueta: string, children: import('react').ReactNode
 * }} props
 */
export default function ConfirmForm({ action, campos, mensaje, className, etiqueta, children }) {
  function confirmar(e) {
    if (!window.confirm(mensaje)) e.preventDefault();
  }

  return (
    <form action={action} onSubmit={confirmar}>
      {Object.entries(campos).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" className={className} aria-label={etiqueta} title={etiqueta}>
        {children}
      </button>
    </form>
  );
}

/* RESUMEN
   Form genérico con confirmación nativa (Client Component mínimo): campos ocultos desde `campos`,
   botón con `etiqueta` accesible y `children` como contenido. Envía la Server Action `action`.
   Depende de: nada */
