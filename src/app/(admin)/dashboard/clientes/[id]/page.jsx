// src/app/(admin)/dashboard/clientes/[id]/page.jsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CircleCheck, House, Plus, Trash2 } from 'lucide-react';
import ClienteForm from '@/components/admin/cliente-form';
import ConfirmForm from '@/components/admin/confirm-form';
import ContactButtons from '@/components/admin/contact-buttons';
import PedidoItem from '@/components/admin/pedido-item';
import VinculoForm from '@/components/admin/vinculo-form';
import VinculoItem from '@/components/admin/vinculo-item';
import { borrarCliente } from '@/actions/clientes';
import { requireAdmin } from '@/lib/auth';
import { getCliente, opcionesPropiedades } from '@/lib/queries/admin-clientes';
import { pedidosDeCliente } from '@/lib/queries/admin-pedidos';
import { categoriasConId } from '@/lib/queries/admin-properties';
import editor from '../../propiedades/editor.module.css';
import styles from './ficha.module.css';

export const metadata = { title: 'Cliente' };

const AVISOS = {
  creado: 'Cliente creado. Ahora puede vincularlo a sus propiedades.',
  guardado: 'Cambios guardados.',
};

export default async function ClientePage({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const { aviso } = await searchParams;
  const [res, propiedades, pedidos, categorias] = await Promise.all([
    getCliente(id),
    opcionesPropiedades(),
    pedidosDeCliente(id),
    categoriasConId(),
  ]);
  if (!res.ok) throw new Error(res.error);
  if (!res.data) notFound();
  const c = res.data;
  const vinculos = (c.vinculos ?? []).filter((v) => v.propiedad);
  const vinculadas = new Set(vinculos.map((v) => v.propiedad.id));
  const volver = `/dashboard/clientes/${c.id}`;

  return (
    <div className={editor.page}>
      <Link href="/dashboard/clientes" className={editor.back}>
        <ArrowLeft size={18} aria-hidden="true" />
        Clientes
      </Link>
      <div className={styles.top}>
        <h1 className={editor.title}>{c.nombre}</h1>
        <ContactButtons
          telefono={c.telefono}
          nombre={c.nombre}
          mensaje={`Hola ${c.nombre.trim().split(/\s+/)[0]}, le escribo de Inmobiliaria Percara.`}
        />
      </div>
      {c.telefono_alt && <p className={editor.lead}>Otro teléfono: {c.telefono_alt}</p>}

      {AVISOS[aviso] && (
        <p className={editor.aviso} role="status">
          <CircleCheck size={18} aria-hidden="true" />
          {AVISOS[aviso]}
        </p>
      )}

      <section className={styles.card} aria-labelledby="props-titulo">
        <h2 id="props-titulo" className={styles.h2}>
          <House size={20} aria-hidden="true" />
          Sus propiedades
        </h2>
        {vinculos.length === 0 ? (
          <p className={styles.empty}>Todavía no está vinculado a ninguna propiedad.</p>
        ) : (
          <ul className={styles.list}>
            {vinculos.map((v) => (
              <VinculoItem
                key={v.propiedad.id}
                modo="cliente"
                cliente={c}
                propiedad={v.propiedad}
                rol={v.rol}
                estado={v.estado}
                notas={v.notas}
              />
            ))}
          </ul>
        )}
        <VinculoForm
          modo="cliente"
          fijoId={c.id}
          opciones={propiedades.filter((p) => !vinculadas.has(p.id))}
        />
      </section>

      <section className={styles.card} aria-labelledby="pedidos-titulo">
        <div className={styles.row}>
          <h2 id="pedidos-titulo" className={styles.h2}>
            Pedidos
          </h2>
          <Link
            href={`/dashboard/pedidos/nuevo?cliente=${c.id}&volver=${encodeURIComponent(volver)}`}
            className={styles.add}
          >
            <Plus size={18} aria-hidden="true" />
            Nuevo pedido
          </Link>
        </div>
        {!pedidos.ok || pedidos.data.length === 0 ? (
          <p className={styles.empty}>
            {pedidos.ok ? 'Sin pedidos para este cliente.' : pedidos.error}
          </p>
        ) : (
          <ul className={styles.list}>
            {pedidos.data.map((p) => (
              <PedidoItem key={p.id} pedido={p} volver={volver} />
            ))}
          </ul>
        )}
      </section>

      <h2 className={styles.h2}>Datos del cliente</h2>
      <ClienteForm cliente={c} categorias={categorias} />

      <ConfirmForm
        action={borrarCliente}
        campos={{ id: c.id }}
        mensaje={`¿Borrar a ${c.nombre}? Se quitan sus vínculos con propiedades. No se puede deshacer.`}
        etiqueta={`Borrar a ${c.nombre}`}
        className={styles.danger}
      >
        <Trash2 size={18} aria-hidden="true" />
        Borrar cliente
      </ConfirmForm>
    </div>
  );
}

/* RESUMEN
   Ficha del cliente (Server Component, verifica admin): nombre con WhatsApp/Llamar, sus propiedades como
   dueño o comprador (con seguimiento y vincular), sus pedidos, el formulario de datos y borrar. Recibe
   params.id y searchParams.aviso. Depende de: components/admin/*, actions/clientes.js, lib/queries/*,
   ../../propiedades/editor.module.css, ficha.module.css */
