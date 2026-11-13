// src/components/admin/login-form.jsx
'use client';

import { useActionState } from 'react';
import { LoaderCircle, LogIn } from 'lucide-react';
import { iniciarSesion } from '@/actions/auth';
import styles from './login-form.module.css';

/** @param {{ next: string }} props */
export default function LoginForm({ next }) {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, null);

  return (
    <form action={accion} className={styles.form}>
      <input type="hidden" name="next" value={next} />

      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          className={styles.input}
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          required
          autoFocus
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Contraseña</span>
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="current-password"
          minLength={6}
          required
        />
      </label>

      <p className={styles.error} role="alert" aria-live="assertive">
        {estado?.ok === false ? estado.error : ''}
      </p>

      <button type="submit" className={styles.submit} disabled={pendiente} aria-busy={pendiente}>
        {pendiente ? (
          <LoaderCircle className={styles.spin} size={18} aria-hidden="true" />
        ) : (
          <LogIn size={18} aria-hidden="true" />
        )}
        {pendiente ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}

/* RESUMEN
   Formulario de login (Client Component: necesita useActionState para mostrar errores y estado de
   envío). Envía email, contraseña y `next` a la Server Action iniciarSesion. Recibe `next`.
   Depende de: actions/auth.js, login-form.module.css, lucide-react */
