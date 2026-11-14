// src/app/(admin)/dashboard/pedidos/page.jsx
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Plus } from 'lucide-react';
import PedidosCalendario from '@/components/admin/pedidos-calendario';
import PedidosLista from '@/components/admin/pedidos-lista';
import VistaToggle from '@/components/admin/vista-toggle';
import { requireAdmin } from '@/lib/auth';
import { grillaMes, hoyAR, mesSeguro } from '@/lib/fechas';
import { pedidosEntre, pedidosParaLista } from '@/lib/queries/admin-pedidos';
import { COOKIE_VISTA_PEDIDOS } from '@/lib/schemas/agenda-etiquetas';
import base from '../propiedades/page.module.css';
import styles from './pedidos.module.css';

export const metadata = { title: 'Carpeta de pedidos' };

export default async function PedidosPage({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const guardada = (await cookies()).get(COOKIE_VISTA_PEDIDOS)?.value;
  const vista = (sp.vista ?? guardada) === 'calendario' ? 'calendario' : 'lista';
  const hoy = hoyAR();
  const mes = mesSeguro(sp.mes);

  let contenido;
  if (vista === 'calendario') {
    const { desde, hasta } = grillaMes(mes);
    const res = await pedidosEntre(desde, hasta);
    contenido = res.ok ? (
      <PedidosCalendario mes={mes} pedidos={res.data} hoy={hoy} />
    ) : (
      <p className={base.empty}>{res.error}</p>
    );
  } else {
    const res = await pedidosParaLista();
    contenido = res.ok ? (
      <PedidosLista {...res.data} hoy={hoy} volver="/dashboard/pedidos?vista=lista" />
    ) : (
      <p className={base.empty}>{res.error}</p>
    );
  }
  const volver =
    vista === 'calendario'
      ? `/dashboard/pedidos?vista=calendario&mes=${mes}`
      : '/dashboard/pedidos?vista=lista';

  return (
    <div className={base.page}>
      <header className={base.head}>
        <div>
          <h1 className={base.title}>Carpeta de pedidos</h1>
          <p className={styles.lead}>Su agenda personal: solo usted la ve.</p>
        </div>
        <Link
          href={`/dashboard/pedidos/nuevo?volver=${encodeURIComponent(volver)}`}
          className={base.cta}
        >
          <Plus size={18} aria-hidden="true" />
          Nuevo pedido
        </Link>
      </header>

      <VistaToggle vista={vista} mes={vista === 'calendario' ? mes : undefined} />
      {contenido}
    </div>
  );
}

/* RESUMEN
   Carpeta de pedidos (Server Component, verifica admin): vista lista o calendario según ?vista o la cookie
   guardada, mes por ?mes, botón "Nuevo pedido" que vuelve a la misma vista. Recibe searchParams.
   Depende de: components/admin/{pedidos-lista,pedidos-calendario,vista-toggle}.jsx, lib/{fechas,auth}.js,
   lib/queries/admin-pedidos.js, ../propiedades/page.module.css, pedidos.module.css */
