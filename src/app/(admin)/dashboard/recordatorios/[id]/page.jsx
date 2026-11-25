// src/app/(admin)/dashboard/recordatorios/[id]/page.jsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CircleCheck, Pencil } from 'lucide-react';
import RecordatorioDetalle from '@/components/admin/recordatorio-detalle';
import Tag from '@/components/admin/tag';
import { requireAdmin } from '@/lib/auth';
import { hoyAR } from '@/lib/fechas';
import { opcionesClientes, opcionesPropiedades } from '@/lib/queries/admin-clientes';
import { getRecordatorio } from '@/lib/queries/admin-recordatorios';
import { ESTADOS_RECORDATORIO } from '@/lib/schemas/recordatorio-etiquetas';
import editor from '../../propiedades/editor.module.css';
import ficha from '../../clientes/[id]/ficha.module.css';

export const metadata = { title: 'Recordatorio' };

const TONO_ESTADO = { en_curso: 'ambar', finalizado: 'verde', cancelado: 'gris' };
const AVISOS = { creado: 'Recordatorio creado.', guardado: 'Cambios guardados.' };

export default async function RecordatorioPage({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const { aviso } = await searchParams;
  const [res, clientes, propiedades] = await Promise.all([
    getRecordatorio(id),
    opcionesClientes(),
    opcionesPropiedades(),
  ]);
  if (!res.ok) throw new Error(res.error);
  if (!res.data) notFound();
  const r = res.data;

  return (
    <div className={editor.page}>
      <Link href="/dashboard/recordatorios" className={editor.back}>
        <ArrowLeft size={18} aria-hidden="true" />
        Recordatorios
      </Link>
      <div className={ficha.top}>
        <h1 className={editor.title}>{r.titulo}</h1>
        <Link href={`/dashboard/recordatorios/${r.id}/editar`} className={ficha.add}>
          <Pencil size={18} aria-hidden="true" />
          Editar
        </Link>
      </div>
      <p>
        <Tag tono={TONO_ESTADO[r.estado]}>{ESTADOS_RECORDATORIO[r.estado]}</Tag>
      </p>

      {AVISOS[aviso] && (
        <p className={editor.aviso} role="status">
          <CircleCheck size={18} aria-hidden="true" />
          {AVISOS[aviso]}
        </p>
      )}

      <p className={editor.lead}>Toque una tarjeta para ver y editar todos sus datos.</p>
      <RecordatorioDetalle
        recordatorio={r}
        hoy={hoyAR()}
        clientes={clientes}
        propiedades={propiedades}
      />
    </div>
  );
}

/* RESUMEN
   Vista de un recordatorio (Server Component, verifica admin): título, estado, botón Editar (todo junto),
   aviso tras guardar y el detalle con tarjetas editables con un clic (necesita clientes y propiedades). Recibe params.id (404 si no existe) y
   searchParams.aviso. Depende de: components/admin/{recordatorio-detalle,tag}.jsx, lib/{auth,fechas}.js,
   lib/queries/{admin-recordatorios,admin-clientes}.js, editor.module.css, clientes/[id]/ficha.module.css */
