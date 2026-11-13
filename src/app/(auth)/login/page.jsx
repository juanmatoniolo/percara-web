// src/app/(auth)/login/page.jsx
import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/login-form';
import { getAdmin } from '@/lib/auth';
import styles from './page.module.css';

/* Ruta oculta: sin links desde el sitio, fuera del sitemap y bloqueada en robots.txt */
export const metadata = {
  title: 'Acceso',
  robots: { index: false, follow: false, nocache: true },
};

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const destino = typeof next === 'string' && next.startsWith('/dashboard') ? next : '/dashboard';
  if (await getAdmin()) redirect(destino);

  return (
    <main className={styles.page}>
      <span className={`${styles.blob} ${styles.blobGreen}`} aria-hidden="true" />
      <span className={`${styles.blob} ${styles.blobBlue}`} aria-hidden="true" />
      <section className={styles.card} aria-labelledby="login-title">
        <p className={styles.brand}>
          Percara <span>Negocios Inmobiliarios</span>
        </p>
        <h1 id="login-title" className={styles.title}>
          Panel de administración
        </h1>
        <p className={styles.lead}>Ingrese con su cuenta de administrador.</p>
        <LoginForm next={destino} />
      </section>
    </main>
  );
}

/* RESUMEN
   Login oculto (Server Component, noindex): si ya hay un admin con sesión, redirige al panel (o a `next`
   interno); si no, muestra la tarjeta con el formulario. Recibe searchParams.next.
   Depende de: components/admin/login-form.jsx, lib/auth.js, page.module.css */
