// src/components/admin/pedido-form.jsx
'use client';

import { useActionState } from 'react';
import { CircleAlert, LoaderCircle, Save } from 'lucide-react';
import FormField from './form-field';
import { guardarPedido } from '@/actions/pedidos';
import { ESTADOS_PEDIDO, ETIQUETAS_AGENDA, PRIORIDADES } from '@/lib/schemas/agenda-etiquetas';
import base from './property-form.module.css';

const s = (v) => (v === null || v === undefined ? '' : String(v));
const opciones = (o) =>
  Object.entries(o).map(([v, t]) => (
    <option key={v} value={v}>
      {t}
    </option>
  ));

/**
 * Alta / edición de un pedido de la Carpeta (Client Component: useActionState).
 * @param {{
 *   pedido?: any, iniciales?: { fecha?: string, cliente_id?: string, propiedad_id?: string },
 *   clientes: { id: string, nombre: string }[], propiedades: { id: string, titulo: string }[],
 *   volver: string
 * }} props
 */
export default function PedidoForm({ pedido, iniciales = {}, clientes, propiedades, volver }) {
  const [estado, accion, pendiente] = useActionState(guardarPedido, null);
  const v = estado?.valores ?? pedido ?? { prioridad: 'normal', estado: 'pendiente', ...iniciales };
  const err = estado?.campos ?? {};
  const conError = Object.keys(err).map((k) => ETIQUETAS_AGENDA[k] ?? k);
  const campo = (name, label, props = {}) => (
    <FormField name={name} label={label} defaultValue={s(v[name])} error={err[name]} {...props} />
  );

  return (
    <form action={accion} className={base.form}>
      {pedido?.id && <input type="hidden" name="id" value={pedido.id} />}
      <input type="hidden" name="volver" value={volver} />

      {estado?.ok === false && (
        <div className={base.alert} role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <p>
            {estado.error}
            {conError.length > 0 && <> ({conError.join(', ')})</>}
          </p>
        </div>
      )}

      <fieldset className={base.group}>
        <legend className={base.legend}>Pedido</legend>
        {campo('titulo', 'Qué hay que hacer', {
          required: true,
          maxLength: 160,
          ancho: 'full',
          hint: 'Ej.: Llamar a Gómez por la casa de calle Sarmiento',
        })}
        {campo('detalle', 'Detalle', { as: 'textarea', ancho: 'full', maxLength: 3000 })}
        {campo('fecha', 'Fecha', {
          type: 'date',
          ancho: 'third',
          hint: 'Sin fecha: queda en "Sin fecha".',
        })}
        {campo('hora', 'Hora', {
          type: 'time',
          ancho: 'third',
          defaultValue: s(v.hora).slice(0, 5),
        })}
        {campo('prioridad', 'Prioridad', {
          as: 'select',
          ancho: 'third',
          children: opciones(PRIORIDADES),
        })}
        {pedido?.id ? (
          campo('estado', 'Estado', {
            as: 'select',
            ancho: 'third',
            children: opciones(ESTADOS_PEDIDO),
          })
        ) : (
          <input type="hidden" name="estado" value="pendiente" />
        )}
      </fieldset>

      <fieldset className={base.group}>
        <legend className={base.legend}>Relacionado con (opcional)</legend>
        {campo('cliente_id', 'Cliente', {
          as: 'select',
          children: [
            <option key="" value="">
              Ninguno
            </option>,
            ...clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            )),
          ],
        })}
        {campo('propiedad_id', 'Propiedad', {
          as: 'select',
          children: [
            <option key="" value="">
              Ninguna
            </option>,
            ...propiedades.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo}
              </option>
            )),
          ],
        })}
      </fieldset>

      <div className={base.bar}>
        <button type="submit" className={base.submit} disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? (
            <LoaderCircle className={base.spin} size={18} aria-hidden="true" />
          ) : (
            <Save size={18} aria-hidden="true" />
          )}
          {pendiente ? 'Guardando…' : pedido?.id ? 'Guardar cambios' : 'Agregar a la carpeta'}
        </button>
      </div>
    </form>
  );
}

/* RESUMEN
   Formulario de la Carpeta de pedidos (Client Component): qué hacer, detalle, fecha, hora, prioridad,
   estado (al editar) y cliente/propiedad opcionales. Envía a guardarPedido, que vuelve a `volver`.
   Depende de: form-field.jsx, actions/pedidos.js, lib/schemas/agenda-etiquetas.js, property-form.module.css */
