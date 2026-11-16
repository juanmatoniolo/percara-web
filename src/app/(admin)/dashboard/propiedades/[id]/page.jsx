// src/app/(admin)/dashboard/propiedades/[id]/page.jsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarPlus, CircleCheck, ExternalLink } from 'lucide-react';
import PropertyForm from '@/components/admin/property-form';
import ImageManager from '@/components/admin/image-manager';
import EstadoBadge from '@/components/admin/estado-badge';
import VinculosPropiedad from '@/components/admin/vinculos-propiedad';
import { requireAdmin } from '@/lib/auth';
import {
  categoriasConId,
  getPropiedadAdmin,
  localidadesCargadas,
} from '@/lib/queries/admin-properties';
import { opcionesClientes, vinculosDePropiedad } from '@/lib/queries/admin-clientes';
import styles from '../editor.module.css';

export const metadata = { title: 'Editar propiedad' };

/** Nuevo pedido en la Carpeta, ya vinculado a la propiedad, que vuelve a esta página al guardar. */
function citaHref(p) {
  const q = new URLSearchParams({
    propiedad: p.id,
    titulo: `Visita: ${p.titulo}`.slice(0, 160),
    volver: `/dashboard/propiedades/${p.id}`,
  });
  return `/dashboard/pedidos/nuevo?${q}`;
}

export default async function EditarPropiedadPage({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const { aviso } = await searchParams;
  const [res, categorias, localidades] = await Promise.all([
    getPropiedadAdmin(id),
    categoriasConId(),
    localidadesCargadas(),
  ]);
  if (!res.ok) throw new Error(res.error);
  if (!res.data) notFound();
  const p = res.data;
  const [vinculos, clientes] = await Promise.all([vinculosDePropiedad(p.id), opcionesClientes()]);

  return (
    <div className={styles.page}>
      <Link href="/dashboard/propiedades" className={styles.back}>
        <ArrowLeft size={18} aria-hidden="true" />
        Propiedades
      </Link>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{p.titulo}</h1>
        <EstadoBadge estado={p.estado} />
      </div>
      <p className={styles.lead}>
        URL: <code>/propiedades/{p.slug}</code>
        {p.estado === 'publicada' && (
          <a href={`/propiedades/${p.slug}`} target="_blank" rel="noopener" className={styles.view}>
            Ver en el sitio <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}{' '}
        <Link href={citaHref(p)} className={styles.view}>
          <CalendarPlus size={16} aria-hidden="true" />
          Agendar cita
        </Link>
      </p>
      {aviso === 'creada' && (
        <p className={styles.aviso} role="status">
          <CircleCheck size={18} aria-hidden="true" />
          Propiedad creada como {p.estado}. Ahora sume las fotos: la primera será la portada.
        </p>
      )}
      <ImageManager propiedadId={p.id} iniciales={Array.isArray(p.imagenes) ? p.imagenes : []} />
      <VinculosPropiedad
        propiedad={p}
        vinculos={vinculos.ok ? vinculos.data.filter((v) => v.cliente) : []}
        clientes={clientes}
        error={vinculos.ok ? undefined : vinculos.error}
      />
      <PropertyForm propiedad={p} categorias={categorias} localidades={localidades} />
    </div>
  );
}

/* RESUMEN
   Edición de propiedad (Server Component, verifica admin): carga por id (404 si no existe), muestra estado,
   URL pública fija, botón Agendar cita (pedido con la propiedad), aviso tras crear, gestor de fotos, dueños y compradores (con WhatsApp) y el formulario.
   Recibe params.id y searchParams.aviso. Depende de: components/admin/{property-form,image-manager,
   estado-badge,vinculos-propiedad}.jsx, lib/auth.js, lib/queries/{admin-properties,admin-clientes}.js,
   ../editor.module.css */
