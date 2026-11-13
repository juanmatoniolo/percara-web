// src/components/admin/form-field.jsx
import styles from './form-field.module.css';

/**
 * Campo de formulario: etiqueta, control (input/select/textarea según `as`), ayuda y error accesibles.
 * @param {{
 *   name: string, label: string, as?: 'input' | 'select' | 'textarea', error?: string[],
 *   hint?: string, ancho?: 'full' | 'half' | 'third', children?: import('react').ReactNode,
 *   [k: string]: any
 * }} props  el resto de props va al control (type, defaultValue, required, step...)
 */
export default function FormField({
  name,
  label,
  as: Control = 'input',
  error,
  hint,
  ancho = 'half',
  children,
  ...rest
}) {
  const id = `f-${name}`;
  const descr =
    [hint && `${id}-hint`, error?.length && `${id}-err`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field} data-ancho={ancho}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {rest.required && (
          <span className={styles.req} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <Control
        id={id}
        name={name}
        className={styles.control}
        aria-invalid={error?.length ? true : undefined}
        aria-describedby={descr}
        {...rest}
      >
        {children}
      </Control>
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error?.length ? (
        <p id={`${id}-err`} className={styles.error}>
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}

/* RESUMEN
   Campo reutilizable del panel (sirve en Server y Client Components): label asociado, control
   input/select/textarea, ayuda y primer error enlazados con aria-describedby y aria-invalid. Ancho por
   `ancho` (full/half/third). Depende de: form-field.module.css */
