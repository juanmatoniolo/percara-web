// src/components/admin/vinculo-form.jsx
'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { CircleAlert, CircleCheck, Link2, LoaderCircle, UserPlus } from 'lucide-react';
import { vincularPropiedad } from '@/actions/clientes';
import { ESTADOS_INTERES, ROLES } from '@/lib/schemas/agenda-etiquetas';
import styles from './vinculo-form.module.css';

/**
 * Agrega un dueño o un comprador. En la ficha de la propiedad se elige el cliente; en la del cliente, la
 * propiedad. Client Component: el seguimiento solo se habilita si el rol es comprador.
 * @param {{
 *   modo: 'propiedad' | 'cliente', fijoId: string,
 *   opciones: { id: string, nombre?: string, titulo?: string, telefono?: string | null }[],
 *   rolInicial?: 'comprador' | 'propietario'
 * }} props
 */
export default function VinculoForm({ modo, fijoId, opciones, rolInicial = 'comprador' }) {
  const [estado, accion, pendiente] = useActionState(vincularPropiedad, null);
  const [rol, setRol] = useState(rolInicial);
  const eligeCliente = modo === 'propiedad';
  const id = `v-${modo}-${fijoId}`;

  return (
    <form action={accion} className={styles.form}>
      <input type="hidden" name={eligeCliente ? 'propiedad_id' : 'cliente_id'} value={fijoId} />
      <p className={styles.title}>
        <Link2 size={18} aria-hidden="true" />
        {eligeCliente ? 'Agregar dueño o comprador' : 'Vincular a una propiedad'}
      </p>

      <label className={styles.field} htmlFor={`${id}-otro`}>
        <span>{eligeCliente ? 'Cliente' : 'Propiedad'}</span>
        <select
          id={`${id}-otro`}
          name={eligeCliente ? 'cliente_id' : 'propiedad_id'}
          required
          className={styles.control}
          defaultValue=""
        >
          <option value="" disabled>
            Elegir…
          </option>
          {opciones.map((o) => (
            <option key={o.id} value={o.id}>
              {eligeCliente ? `${o.nombre}${o.telefono ? ` · ${o.telefono}` : ''}` : o.titulo}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field} htmlFor={`${id}-rol`}>
        <span>Es</span>
        <select
          id={`${id}-rol`}
          name="rol"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          className={styles.control}
        >
          {Object.entries(ROLES).map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field} htmlFor={`${id}-estado`}>
        <span>Seguimiento</span>
        <select
          id={`${id}-estado`}
          name="estado"
          disabled={rol !== 'comprador'}
          defaultValue="interesado"
          className={styles.control}
        >
          {Object.entries(ESTADOS_INTERES).map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className={`${styles.field} ${styles.wide}`} htmlFor={`${id}-notas`}>
        <span>Notas (opcional)</span>
        <input
          id={`${id}-notas`}
          name="notas"
          maxLength={500}
          className={styles.control}
          placeholder="Ej.: ofreció USD 80.000 en efectivo"
        />
      </label>

      <div className={styles.bar}>
        {eligeCliente && (
          <Link href="/dashboard/clientes/nuevo" className={styles.link}>
            <UserPlus size={18} aria-hidden="true" />
            Cliente nuevo
          </Link>
        )}
        <button type="submit" className={styles.submit} disabled={pendiente} aria-busy={pendiente}>
          {pendiente && <LoaderCircle className={styles.spin} size={18} aria-hidden="true" />}
          {pendiente ? 'Guardando…' : 'Agregar'}
        </button>
      </div>

      {estado && (
        <p className={estado.ok ? styles.ok : styles.error} role={estado.ok ? 'status' : 'alert'}>
          {estado.ok ? (
            <CircleCheck size={18} aria-hidden="true" />
          ) : (
            <CircleAlert size={18} aria-hidden="true" />
          )}
          {estado.ok ? 'Listo, quedó vinculado.' : estado.error}
        </p>
      )}
    </form>
  );
}

/* RESUMEN
   Form para vincular cliente y propiedad (Client Component): elige el otro lado, rol (dueño/comprador),
   seguimiento (solo comprador) y notas; envía a vincularPropiedad y avisa el resultado. Link a crear
   cliente. Recibe `modo`, `fijoId`, `opciones`, `rolInicial`. Depende de: actions/clientes.js, module.css */
