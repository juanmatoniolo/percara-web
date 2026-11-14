// src/components/admin/cliente-form.jsx
'use client';

import { useActionState } from 'react';
import { CircleAlert, LoaderCircle, Save } from 'lucide-react';
import FormField from './form-field';
import { guardarCliente } from '@/actions/clientes';
import { ESTADOS_CIVILES, ETIQUETAS_AGENDA, ORIGENES } from '@/lib/schemas/agenda-etiquetas';
import base from './property-form.module.css';
import styles from './cliente-form.module.css';

const s = (v) => (v === null || v === undefined ? '' : String(v));
const NUEVO = { moneda: 'USD', activo: true };
const opciones = (o) =>
  Object.entries(o).map(([v, t]) => (
    <option key={v} value={v}>
      {t}
    </option>
  ));

/* Datos para reserva y escritura: [campo, etiqueta, props extra] */
const ESCRITURA = [
  ['dni_cuit', 'DNI / CUIT', { inputMode: 'numeric', maxLength: 20 }],
  ['fecha_nacimiento', 'Fecha de nacimiento', { type: 'date' }],
  ['nacionalidad', 'Nacionalidad', { maxLength: 60, placeholder: 'Argentina' }],
  ['profesion', 'Profesión u ocupación', { maxLength: 80 }],
  ['domicilio', 'Domicilio real', { maxLength: 200, ancho: 'full' }],
  ['conyuge', 'Cónyuge (nombre y DNI)', { maxLength: 160, ancho: 'full' }],
];

/**
 * Alta / edición de cliente (Client Component: useActionState para errores y envío).
 * @param {{ cliente?: any, categorias: { id: number, nombre: string }[] }} props
 */
export default function ClienteForm({ cliente, categorias }) {
  const [estado, accion, pendiente] = useActionState(guardarCliente, null);
  const v = estado?.valores ?? cliente ?? NUEVO;
  const err = estado?.campos ?? {};
  const conError = Object.keys(err).map((k) => ETIQUETAS_AGENDA[k] ?? k);
  const tieneEscritura = ESCRITURA.some(([k]) => v[k]) || v.estado_civil;
  const campo = (name, label, props = {}) => (
    <FormField name={name} label={label} defaultValue={s(v[name])} error={err[name]} {...props} />
  );

  return (
    <form action={accion} className={base.form}>
      {cliente?.id && <input type="hidden" name="id" value={cliente.id} />}

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
        <legend className={base.legend}>Contacto</legend>
        {campo('nombre', 'Nombre y apellido', { required: true, maxLength: 120, ancho: 'full' })}
        {campo('telefono', 'Teléfono / WhatsApp', {
          type: 'tel',
          maxLength: 30,
          hint: 'Como lo tenga: 3456 55-3422, 03456 15553422…',
        })}
        {campo('telefono_alt', 'Otro teléfono', { type: 'tel', maxLength: 30 })}
        {campo('email', 'Email', { type: 'email', maxLength: 160 })}
        {campo('localidad', 'Localidad', { maxLength: 80, placeholder: 'Chajarí' })}
        {campo('origen', 'Cómo nos conoció', {
          as: 'select',
          children: [
            <option key="" value="">
              Sin dato
            </option>,
            ...opciones(ORIGENES),
          ],
        })}
        <label className={base.check}>
          <input
            type="checkbox"
            name="activo"
            defaultChecked={v.activo === true || v.activo === 'on'}
          />
          <span>
            Cliente activo
            <small>Los inactivos quedan al final de la lista.</small>
          </span>
        </label>
      </fieldset>

      <fieldset className={base.group}>
        <legend className={base.legend}>Qué busca</legend>
        {campo('busca', 'En sus palabras', {
          as: 'textarea',
          ancho: 'full',
          maxLength: 1000,
          hint: 'Ej.: casa de 3 dormitorios con patio, zona centro.',
        })}
        {campo('categoria_id', 'Tipo de propiedad', {
          as: 'select',
          children: [
            <option key="" value="">
              Cualquiera
            </option>,
            ...categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            )),
          ],
        })}
        {campo('presupuesto', 'Presupuesto', {
          type: 'number',
          min: '0',
          step: 'any',
          inputMode: 'decimal',
          ancho: 'third',
        })}
        {campo('moneda', 'Moneda', {
          as: 'select',
          ancho: 'third',
          children: [
            <option key="USD" value="USD">
              USD
            </option>,
            <option key="ARS" value="ARS">
              ARS
            </option>,
          ],
        })}
        {campo('notas', 'Notas', { as: 'textarea', ancho: 'full', maxLength: 3000 })}
      </fieldset>

      <details className={styles.extra} open={Boolean(tieneEscritura)}>
        <summary className={styles.summary}>Datos para reserva y escritura (opcionales)</summary>
        <fieldset className={`${base.group} ${styles.inner}`}>
          <legend className="sr-only">Datos para reserva y escritura</legend>
          {ESCRITURA.map(([name, label, props]) => (
            <FormField
              key={name}
              name={name}
              label={label}
              defaultValue={s(v[name])}
              error={err[name]}
              {...props}
            />
          ))}
          {campo('estado_civil', 'Estado civil', {
            as: 'select',
            children: [
              <option key="" value="">
                Sin dato
              </option>,
              ...opciones(ESTADOS_CIVILES),
            ],
          })}
        </fieldset>
      </details>

      <div className={base.bar}>
        <button type="submit" className={base.submit} disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? (
            <LoaderCircle className={base.spin} size={18} aria-hidden="true" />
          ) : (
            <Save size={18} aria-hidden="true" />
          )}
          {pendiente ? 'Guardando…' : cliente?.id ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </div>
    </form>
  );
}

/* RESUMEN
   Formulario de cliente (Client Component): contacto, qué busca (tipo, presupuesto, notas) y un
   desplegable con datos opcionales para escritura. Envía a guardarCliente; errores por campo sin perder lo
   escrito. Depende de: form-field.jsx, actions/clientes.js, lib/schemas/agenda-etiquetas.js, module.css */
