// src/app/(admin)/dashboard/recordatorios/nuevo/page.jsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RecordatorioForm from '@/components/admin/recordatorio-form';
import { requireAdmin } from '@/lib/auth';
import { opcionesClientes, opcionesPropiedades } from '@/lib/queries/admin-clientes';
import styles from '../../propiedades/editor.module.css';

export const metadata = { title: 'Nuevo recordatorio' };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function NuevoRecordatorioPage({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const [clientes, propiedades] = await Promise.all([opcionesClientes(), opcionesPropiedades()]);
  /* Se puede abrir ya vinculado: ?cliente=uuid&propiedad=uuid */
  const iniciales = {
    forma_pago: 'contado',
    moneda: 'USD',
    estado: 'en_curso',
    cliente_id: UUID.test(sp.cliente ?? '') ? sp.cliente : '',
    propiedad_id: UUID.test(sp.propiedad ?? '') ? sp.propiedad : '',
  };

  return (
    <div className={styles.page}>
      <Link href="/dashboard/recordatorios" className={styles.back}>
        <ArrowLeft size={18} aria-hidden="true" />
        Recordatorios
      </Link>
      <h1 className={styles.title}>Nuevo recordatorio</h1>
      <p className={styles.lead}>
        Registre cómo se cerró el negocio: quién compró, qué propiedad y cómo se pagó.
      </p>
      <RecordatorioForm recordatorio={iniciales} clientes={clientes} propiedades={propiedades} />
    </div>
  );
}

/* RESUMEN
   Alta de recordatorio (Server Component, verifica admin): carga clientes y propiedades para los buscadores
   y permite llegar ya vinculado (?cliente=, ?propiedad=). Depende de: components/admin/recordatorio-form.jsx,
   lib/auth.js, lib/queries/admin-clientes.js, ../../propiedades/editor.module.css */
