// src/app/(admin)/dashboard/propiedades/nueva/page.jsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PropertyForm from '@/components/admin/property-form';
import { requireAdmin } from '@/lib/auth';
import { categoriasConId } from '@/lib/queries/admin-properties';
import styles from '../editor.module.css';

export const metadata = { title: 'Nueva propiedad' };

export default async function NuevaPropiedadPage() {
  await requireAdmin();
  const categorias = await categoriasConId();

  return (
    <div className={styles.page}>
      <Link href="/dashboard/propiedades" className={styles.back}>
        <ArrowLeft size={18} aria-hidden="true" />
        Propiedades
      </Link>
      <h1 className={styles.title}>Nueva propiedad</h1>
      <p className={styles.lead}>
        Complete los datos y cree la propiedad; en el paso siguiente se suman las fotos.
      </p>
      <PropertyForm categorias={categorias} />
    </div>
  );
}

/* RESUMEN
   Alta de propiedad (Server Component, verifica admin): volver al listado, título y formulario vacío con
   las categorías de la base. Depende de: components/admin/property-form.jsx, lib/auth.js,
   lib/queries/admin-properties.js, ../editor.module.css */
