// src/app/(admin)/dashboard/pedidos/[id]/page.jsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import ConfirmForm from '@/components/admin/confirm-form';
import PedidoForm from '@/components/admin/pedido-form';
import { borrarPedido } from '@/actions/pedidos';
import { requireAdmin } from '@/lib/auth';
import { opcionesClientes, opcionesPropiedades } from '@/lib/queries/admin-clientes';
import { getPedido } from '@/lib/queries/admin-pedidos';
import { volverSchema } from '@/lib/schemas/pedido';
import editor from '../../propiedades/editor.module.css';
import styles from '../pedidos.module.css';

export const metadata = { title: 'Editar pedido' };

export default async function EditarPedidoPage({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const volver = volverSchema.parse((await searchParams).volver ?? '');
  const [res, clientes, propiedades] = await Promise.all([
    getPedido(id),
    opcionesClientes(),
    opcionesPropiedades(),
  ]);
  if (!res.ok) throw new Error(res.error);
  if (!res.data) notFound();
  const p = res.data;
  /* Un cliente inactivo vinculado al pedido no aparece en las opciones: se agrega para no perderlo */
  if (p.cliente && !clientes.some((c) => c.id === p.cliente.id)) clientes.unshift(p.cliente);

  return (
    <div className={editor.page}>
      <Link href={volver} className={editor.back}>
        <ArrowLeft size={18} aria-hidden="true" />
        Volver
      </Link>
      <h1 className={editor.title}>Editar pedido</h1>
      <PedidoForm pedido={p} clientes={clientes} propiedades={propiedades} volver={volver} />
      <ConfirmForm
        action={borrarPedido}
        campos={{ id: p.id, volver }}
        mensaje={`¿Borrar "${p.titulo}"? No se puede deshacer.`}
        etiqueta="Borrar pedido"
        className={styles.danger}
      >
        <Trash2 size={18} aria-hidden="true" />
        Borrar pedido
      </ConfirmForm>
    </div>
  );
}

/* RESUMEN
   Edición de pedido (Server Component, verifica admin; RLS solo deja ver los propios): formulario
   precargado, borrar con confirmación y vuelta a la vista de origen. Recibe params.id y searchParams.volver.
   Depende de: components/admin/{pedido-form,confirm-form}.jsx, actions/pedidos.js, lib/queries/*,
   lib/schemas/pedido.js, editor.module.css, ../pedidos.module.css */
