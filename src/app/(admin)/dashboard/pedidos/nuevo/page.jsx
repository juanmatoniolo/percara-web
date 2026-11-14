// src/app/(admin)/dashboard/pedidos/nuevo/page.jsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PedidoForm from '@/components/admin/pedido-form';
import { requireAdmin } from '@/lib/auth';
import { opcionesClientes, opcionesPropiedades } from '@/lib/queries/admin-clientes';
import { volverSchema } from '@/lib/schemas/pedido';
import styles from '../../propiedades/editor.module.css';

export const metadata = { title: 'Nuevo pedido' };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function NuevoPedidoPage({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const volver = volverSchema.parse(sp.volver ?? '');
  const iniciales = {
    fecha: /^\d{4}-\d{2}-\d{2}$/.test(sp.fecha ?? '') ? sp.fecha : '',
    cliente_id: UUID.test(sp.cliente ?? '') ? sp.cliente : '',
    propiedad_id: UUID.test(sp.propiedad ?? '') ? sp.propiedad : '',
  };
  const [clientes, propiedades] = await Promise.all([opcionesClientes(), opcionesPropiedades()]);

  return (
    <div className={styles.page}>
      <Link href={volver} className={styles.back}>
        <ArrowLeft size={18} aria-hidden="true" />
        Volver
      </Link>
      <h1 className={styles.title}>Nuevo pedido</h1>
      <p className={styles.lead}>
        Anote lo que tenga que hacer; la fecha y el cliente son opcionales.
      </p>
      <PedidoForm
        iniciales={iniciales}
        clientes={clientes}
        propiedades={propiedades}
        volver={volver}
      />
    </div>
  );
}

/* RESUMEN
   Alta de pedido (Server Component, verifica admin): precarga fecha, cliente o propiedad desde la URL
   (validados) y vuelve a la vista de origen (?volver, solo /dashboard...). Depende de:
   components/admin/pedido-form.jsx, lib/queries/admin-clientes.js, lib/schemas/pedido.js, editor.module.css */
