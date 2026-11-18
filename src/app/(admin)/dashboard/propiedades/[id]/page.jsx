// src/app/(admin)/dashboard/propiedades/[id]/page.jsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BellRing, CalendarPlus, CircleCheck, ExternalLink } from 'lucide-react';
import PropertyForm from '@/components/admin/property-form';
import ImageManager from '@/components/admin/image-manager';
import EstadoBadge from '@/components/admin/estado-badge';
import VinculosPropiedad from '@/components/admin/vinculos-propiedad';
import VisibilidadVendida from '@/components/admin/visibilidad-vendida';
import { requireAdmin } from '@/lib/auth';
import { plural } from '@/lib/format';
import {
  categoriasConId,
  getPropiedadAdmin,
  lugaresCargados,
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

/** Aviso tras el alta: estado, cuántas fotos subieron y cuántas faltan. */
function avisoCreada(estado, subidas, fallidas) {
  const base = `Propiedad creada como ${estado}`;
  if (fallidas)
    return `${base} con ${plural(subidas, 'foto', 'fotos')}. ${plural(fallidas, 'foto no se pudo', 'fotos no se pudieron')} subir: vuelva a sumarlas abajo.`;
  if (subidas) return `${base} con ${plural(subidas, 'foto', 'fotos')}.`;
  return `${base}. Sume las fotos abajo: la primera será la portada.`;
}

export default async function EditarPropiedadPage({ params, searchParams }) {
  await requireAdmin();
  const { id } = await params;
  const { aviso, fotos, fallidas: fallidasQ } = await searchParams;
  const subidas = Math.max(0, Number.parseInt(fotos, 10) || 0);
  const fallidas = Math.max(0, Number.parseInt(fallidasQ, 10) || 0);
  const [res, categorias, lugares] = await Promise.all([
    getPropiedadAdmin(id),
    categoriasConId(),
    lugaresCargados(),
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
        {(p.estado === 'publicada' ||
          (p.estado === 'vendida' && new Date(p.vendida_hasta) > new Date())) && (
          <a href={`/propiedades/${p.slug}`} target="_blank" rel="noopener" className={styles.view}>
            Ver en el sitio <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}{' '}
        <Link href={citaHref(p)} className={styles.view}>
          <CalendarPlus size={16} aria-hidden="true" />
          Agendar cita
        </Link>{' '}
        <Link href={`/dashboard/recordatorios/nuevo?propiedad=${p.id}`} className={styles.view}>
          <BellRing size={16} aria-hidden="true" />
          Registrar negocio
        </Link>
      </p>
      <VisibilidadVendida propiedad={p} />
      {aviso === 'creada' && (
        <p className={styles.aviso} role="status">
          <CircleCheck size={18} aria-hidden="true" />
          {avisoCreada(p.estado, subidas, fallidas)}
        </p>
      )}
      <ImageManager propiedadId={p.id} iniciales={Array.isArray(p.imagenes) ? p.imagenes : []} />
      <VinculosPropiedad
        propiedad={p}
        vinculos={vinculos.ok ? vinculos.data.filter((v) => v.cliente) : []}
        clientes={clientes}
        error={vinculos.ok ? undefined : vinculos.error}
      />
      <PropertyForm propiedad={p} categorias={categorias} lugares={lugares} />
    </div>
  );
}

/* RESUMEN
   Edición de propiedad (Server Component, verifica admin): carga por id (404 si no existe), muestra estado,
   URL pública fija, días visibles si está vendida (con renovar), botones Agendar cita (pedido) y Registrar negocio (recordatorio) con la propiedad, aviso tras crear, gestor de fotos, dueños y compradores (con WhatsApp) y el formulario.
   Recibe params.id y searchParams.{aviso, fotos, fallidas} (aviso del alta con fotos). Depende de: components/admin/{property-form,image-manager,
   estado-badge,vinculos-propiedad,visibilidad-vendida}.jsx, lib/auth.js, lib/queries/{admin-properties,admin-clientes}.js,
   ../editor.module.css */
