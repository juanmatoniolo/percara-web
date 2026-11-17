// src/components/admin/recordatorio-form.jsx
'use client';

import { useActionState, useState } from 'react';
import { CircleAlert, LoaderCircle, Save } from 'lucide-react';
import BuscadorSelect from './buscador-select';
import FormField from './form-field';
import { guardarRecordatorio } from '@/actions/recordatorios';
import {
  CON_CUOTAS,
  ESTADOS_RECORDATORIO,
  ETIQUETAS_RECORDATORIO,
  FORMAS_PAGO,
  MEDIOS_PAGO,
  MONEDAS,
} from '@/lib/schemas/recordatorio-etiquetas';
import base from './property-form.module.css';
import ff from './form-field.module.css';

const s = (v) => (v === null || v === undefined ? '' : String(v));
const opciones = (o, vacio) => [
  ...(vacio
    ? [
        <option key="" value="">
          {vacio}
        </option>,
      ]
    : []),
  ...Object.entries(o).map(([v, t]) => (
    <option key={v} value={v}>
      {t}
    </option>
  )),
];
const MONTO = { type: 'number', min: '0', step: 'any', inputMode: 'decimal', ancho: 'third' };
const NUEVO = { forma_pago: 'contado', moneda: 'USD', estado: 'en_curso' };

/**
 * Alta / edición de un recordatorio (Client Component: useActionState + muestra cuotas según la forma).
 * @param {{ recordatorio?: any, clientes: { id: string, nombre: string, telefono?: string | null }[],
 *   propiedades: { id: string, titulo: string }[] }} props
 */
export default function RecordatorioForm({ recordatorio, clientes, propiedades }) {
  const [estado, accion, pendiente] = useActionState(guardarRecordatorio, null);
  const v = estado?.valores ?? recordatorio ?? NUEVO;
  const err = estado?.campos ?? {};
  const [forma, setForma] = useState(s(v.forma_pago) || 'contado');
  const conError = Object.keys(err).map((k) => ETIQUETAS_RECORDATORIO[k] ?? k);
  const campo = (name, label, props = {}) => (
    <FormField name={name} label={label} defaultValue={s(v[name])} error={err[name]} {...props} />
  );
  const buscador = (name, label, lista, placeholder) => (
    <BuscadorSelect
      name={name}
      label={label}
      ancho="half"
      opciones={lista}
      defaultValue={s(v[name])}
      placeholder={placeholder}
      error={err[name]}
      className={ff.field}
      labelClassName={ff.label}
      inputClassName={ff.control}
    />
  );

  return (
    <form action={accion} className={base.form}>
      {recordatorio?.id && <input type="hidden" name="id" value={recordatorio.id} />}
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
        <legend className={base.legend}>Negocio</legend>
        {campo('titulo', 'Título', {
          required: true,
          maxLength: 160,
          ancho: 'full',
          hint: 'Ej.: Venta casa Gregoria Pérez 2036 a Gómez',
        })}
        {buscador(
          'cliente_id',
          'Cliente',
          clientes.map((c) => ({ id: c.id, texto: c.nombre, detalle: c.telefono ?? '' })),
          'Nombre o teléfono…',
        )}
        {buscador(
          'propiedad_id',
          'Propiedad',
          propiedades.map((p) => ({ id: p.id, texto: p.titulo })),
          'Título de la propiedad…',
        )}
        {campo('fecha_operacion', 'Fecha del negocio', { type: 'date', ancho: 'third' })}
        {campo('estado', 'Estado', {
          as: 'select',
          ancho: 'third',
          children: opciones(ESTADOS_RECORDATORIO),
        })}
      </fieldset>

      <fieldset className={base.group}>
        <legend className={base.legend}>Cómo se pagó</legend>
        {campo('forma_pago', 'Forma de pago', {
          as: 'select',
          ancho: 'third',
          onChange: (e) => setForma(e.target.value),
          children: opciones(FORMAS_PAGO),
        })}
        {campo('medio_pago', 'Medio de pago', {
          as: 'select',
          ancho: 'third',
          children: opciones(MEDIOS_PAGO, 'Sin indicar'),
        })}
        {campo('moneda', 'Moneda', { as: 'select', ancho: 'third', children: opciones(MONEDAS) })}
        {campo('monto_total', 'Monto total', MONTO)}
        {campo('anticipo', 'Anticipo / seña', MONTO)}
      </fieldset>

      <fieldset
        className={base.group}
        /* .group es display: grid y pisa el atributo hidden: se oculta con estilo y se conservan los valores */
        style={CON_CUOTAS.has(forma) ? undefined : { display: 'none' }}
      >
        <legend className={base.legend}>Cuotas</legend>
        {campo('cantidad_cuotas', 'Cantidad de cuotas', {
          ...MONTO,
          min: '1',
          step: '1',
          inputMode: 'numeric',
        })}
        {campo('monto_cuota', 'Monto de cada cuota', MONTO)}
        {campo('moneda_cuotas', 'Moneda de las cuotas', {
          as: 'select',
          ancho: 'third',
          children: opciones(MONEDAS, 'Igual al total'),
        })}
        {campo('primer_vencimiento', 'Primer vencimiento', {
          type: 'date',
          ancho: 'third',
          hint: 'Las siguientes se calculan mes a mes.',
        })}
      </fieldset>

      <fieldset className={base.group}>
        <legend className={base.legend}>Observaciones</legend>
        {campo('observaciones', 'Observaciones', {
          as: 'textarea',
          ancho: 'full',
          maxLength: 5000,
          hint: 'Texto libre: ajuste de cuotas, escribano, acuerdos, lo que haga falta recordar.',
        })}
      </fieldset>

      <div className={base.bar}>
        <button type="submit" className={base.submit} disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? (
            <LoaderCircle className={base.spin} size={18} aria-hidden="true" />
          ) : (
            <Save size={18} aria-hidden="true" />
          )}
          {pendiente ? 'Guardando…' : recordatorio?.id ? 'Guardar cambios' : 'Guardar recordatorio'}
        </button>
      </div>
    </form>
  );
}

/* RESUMEN
   Formulario de Recordatorios (Client Component): negocio (título, cliente y propiedad con buscador, fecha,
   estado), cómo se pagó (forma, medio, moneda, total, anticipo), cuotas (solo si la forma las lleva) y
   observaciones libres. Envía a guardarRecordatorio. Depende de: form-field.jsx, buscador-select.jsx,
   actions/recordatorios.js, lib/schemas/recordatorio-etiquetas.js, property-form.module.css */
