// src/app/(admin)/dashboard/recordatorios/[id]/editar/page.jsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import ConfirmForm from '@/components/admin/confirm-form';
import RecordatorioForm from '@/components/admin/recordatorio-form';
import { borrarRecordatorio } from '@/actions/recordatorios';
import { requireAdmin } from '@/lib/auth';
import { opcionesClientes, opcionesPropiedades } from '@/lib/queries/admin-clientes';
import { getRecordatorio } from '@/lib/queries/admin-recordatorios';
import editor from '../../../propiedades/editor.module.css';
import styles from '../../../pedidos/pedidos.module.css';

export const metadata = { title: 'Editar recordatorio' };

export default async function EditarRecordatorioPage({ params }) {
  await requireAdmin();
  const { id } = await params;
  const [res, clientes, propiedades] = await Promise.all([
    getRecordatorio(id),
    opcionesClientes(),
    opcionesPropiedades(),
  ]);
  if (!res.ok) throw new Error(res.error);
  if (!res.data) notFound();
  const r = res.data;
  /* Un cliente inactivo vinculado no aparece en las opciones: se agrega para no perderlo */
  if (r.cliente && !clientes.some((c) => c.id === r.cliente.id)) clientes.unshift(r.cliente);

  return (
    <div className={editor.page}>
      <Link href={`/dashboard/recordatorios/${r.id}`} className={editor.back}>
        <ArrowLeft size={18} aria-hidden="true" />
        Volver al recordatorio
      </Link>
      <h1 className={editor.title}>Editar: {r.titulo}</h1>
      <RecordatorioForm recordatorio={r} clientes={clientes} propiedades={propiedades} />
      <ConfirmForm
        action={borrarRecordatorio}
        campos={{ id: r.id }}
        mensaje={`¿Borrar "${r.titulo}"? No se puede deshacer.`}
        etiqueta="Borrar recordatorio"
        className={styles.danger}
      >
        <Trash2 size={18} aria-hidden="true" />
        Borrar recordatorio
      </ConfirmForm>
    </div>
  );
}

/* RESUMEN
   Edición de recordatorio (Server Component, verifica admin): formulario precargado y borrar con
   confirmación; vuelve a la vista del recordatorio. Recibe params.id (404 si no existe). Depende de:
   components/admin/{recordatorio-form,confirm-form}.jsx, actions/recordatorios.js,
   lib/queries/{admin-clientes,admin-recordatorios}.js, editor.module.css, pedidos.module.css */
