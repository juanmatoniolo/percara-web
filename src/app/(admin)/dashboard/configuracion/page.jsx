// src/app/(admin)/dashboard/configuracion/page.jsx
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import ConfiguracionForm from '@/components/admin/configuracion-form';
import { requireAdmin } from '@/lib/auth';
import { getConfiguracionAdmin } from '@/lib/queries/settings';
import styles from '../propiedades/editor.module.css';

export const metadata = { title: 'Datos de la inmobiliaria' };

export default async function ConfiguracionPage() {
  await requireAdmin();
  const res = await getConfiguracionAdmin();

  return (
    <div className={styles.page}>
      <Link href="/dashboard" className={styles.back}>
        <ArrowLeft size={18} aria-hidden="true" />
        Resumen
      </Link>
      <h1 className={styles.title}>Datos de la inmobiliaria</h1>
      <p className={styles.lead}>
        Teléfono, WhatsApp, email, oficina y redes que muestra todo el sitio: botones de contacto,
        botón flotante de WhatsApp, pie de página y datos para Google.
        <a href="/contacto" target="_blank" rel="noopener" className={styles.view}>
          Ver en el sitio <ExternalLink size={14} aria-hidden="true" />
        </a>
      </p>
      {res.ok ? (
        <ConfiguracionForm config={res.data} />
      ) : (
        <p className={styles.aviso} role="alert">
          {res.error}
        </p>
      )}
    </div>
  );
}

/* RESUMEN
   Página "Datos de la inmobiliaria" (Server Component, verifica admin): carga la fila de configuración
   y muestra el formulario para editar los datos de contacto que usa todo el sitio.
   Depende de: components/admin/configuracion-form.jsx, lib/auth.js, lib/queries/settings.js,
   ../propiedades/editor.module.css */
