// src/app/(admin)/dashboard/clientes/nuevo/page.jsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ClienteForm from '@/components/admin/cliente-form';
import { requireAdmin } from '@/lib/auth';
import styles from '../../propiedades/editor.module.css';

export const metadata = { title: 'Nuevo cliente' };

export default async function NuevoClientePage() {
  await requireAdmin();

  return (
    <div className={styles.page}>
      <Link href="/dashboard/clientes" className={styles.back}>
        <ArrowLeft size={18} aria-hidden="true" />
        Clientes
      </Link>
      <h1 className={styles.title}>Nuevo cliente</h1>
      <p className={styles.lead}>
        Solo el nombre es obligatorio. Después de crearlo puede vincularlo a sus propiedades y
        anotar lo que busca como pedido en la Carpeta.
      </p>
      <ClienteForm />
    </div>
  );
}

/* RESUMEN
   Alta de cliente (Server Component, verifica admin): volver a la agenda, título y formulario vacío.
   Depende de: components/admin/cliente-form.jsx, lib/auth.js, ../../propiedades/editor.module.css */
