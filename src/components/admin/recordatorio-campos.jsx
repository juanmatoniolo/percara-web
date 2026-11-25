// src/components/admin/recordatorio-campos.jsx
'use client';

import { useState } from 'react';
import BuscadorSelect from './buscador-select';
import ClienteCampo from './cliente-campo';
import FormField from './form-field';
import {
  CON_CUOTAS,
  ESTADOS_RECORDATORIO,
  FORMAS_PAGO,
  MEDIOS_PAGO,
  MONEDAS,
} from '@/lib/schemas/recordatorio-etiquetas';
import ff from './form-field.module.css';

const s = (v) => (v === null || v === undefined ? '' : String(v));
const opciones = (o, vacio) =>
  [...(vacio ? [['', vacio]] : []), ...Object.entries(o)].map(([v, t]) => (
    <option key={v} value={v}>
      {t}
    </option>
  ));
const MONTO = { type: 'number', min: '0', step: 'any', inputMode: 'decimal', ancho: 'third' };

/** Arma un FormField con el valor y el error del campo. */
const campoDe =
  (v, err) =>
  (name, label, props = {}) => (
    <FormField name={name} label={label} defaultValue={s(v[name])} error={err[name]} {...props} />
  );

/**
 * Campos del negocio: título, cliente (con alta rápida), propiedad, fecha y estado.
 * @param {{ v: any, err: Record<string, string[]>, clientes: { id: string, nombre: string,
 *   telefono?: string | null }[], propiedades: { id: string, titulo: string }[] }} props
 */
export function CamposNegocio({ v, err, clientes, propiedades }) {
  const campo = campoDe(v, err);
  /* `n` remonta el buscador cuando la propiedad la completa el alta rápida de cliente */
  const [propiedad, setPropiedad] = useState({ id: s(v.propiedad_id), n: 0 });
  return (
    <>
      {campo('titulo', 'Título', {
        required: true,
        maxLength: 160,
        ancho: 'full',
        hint: 'Ej.: Venta casa Gregoria Pérez 2036 a Gómez',
      })}
      <ClienteCampo
        name="cliente_id"
        clientes={clientes}
        propiedades={propiedades}
        defaultValue={s(v.cliente_id)}
        error={err.cliente_id}
        propiedadActual={propiedad.id}
        onPropiedades={(ids) =>
          !propiedad.id && ids[0] && setPropiedad((p) => ({ id: ids[0], n: p.n + 1 }))
        }
      />
      <BuscadorSelect
        key={propiedad.n}
        name="propiedad_id"
        label="Propiedad"
        ancho="half"
        opciones={propiedades.map((p) => ({ id: p.id, texto: p.titulo }))}
        defaultValue={propiedad.id}
        placeholder="Título de la propiedad…"
        error={err.propiedad_id}
        onChange={(o) => setPropiedad((p) => ({ ...p, id: o?.id ?? '' }))}
        className={ff.field}
        labelClassName={ff.label}
        inputClassName={ff.control}
      />
      {campo('fecha_operacion', 'Fecha del negocio', { type: 'date', ancho: 'third' })}
      {campo('estado', 'Estado', {
        as: 'select',
        ancho: 'third',
        children: opciones(ESTADOS_RECORDATORIO),
      })}
    </>
  );
}

/**
 * Campos del pago: forma, medio, moneda, total y anticipo. Las cuotas las muestra quien lo usa según
 * la forma elegida (avisa con onForma).
 * @param {{ v: any, err: Record<string, string[]>, onForma?: (forma: string) => void }} props
 */
export function CamposPago({ v, err, onForma }) {
  const campo = campoDe(v, err);
  return (
    <>
      {campo('forma_pago', 'Forma de pago', {
        as: 'select',
        ancho: 'third',
        onChange: (e) => onForma?.(e.target.value),
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
    </>
  );
}

/** Campos de cuotas. @param {{ v: any, err: Record<string, string[]> }} props */
export function CamposCuotas({ v, err }) {
  const campo = campoDe(v, err);
  return (
    <>
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
    </>
  );
}

/** Pago con cuotas incluidas (se ocultan si la forma no las lleva, sin perder lo escrito). */
export function CamposPagoCompleto({ v, err }) {
  const [forma, setForma] = useState(s(v.forma_pago) || 'contado');
  return (
    <>
      <CamposPago v={v} err={err} onForma={setForma} />
      {/* display: contents mantiene los campos en la grilla del contenedor */}
      <div style={{ display: CON_CUOTAS.has(forma) ? 'contents' : 'none' }}>
        <CamposCuotas v={v} err={err} />
      </div>
    </>
  );
}

/** Observaciones libres. @param {{ v: any, err: Record<string, string[]> }} props */
export function CampoObservaciones({ v, err }) {
  return campoDe(v, err)('observaciones', 'Observaciones', {
    as: 'textarea',
    ancho: 'full',
    maxLength: 5000,
    hint: 'Texto libre: ajuste de cuotas, escribano, acuerdos, lo que haga falta recordar.',
  });
}

/* RESUMEN
   Campos de Recordatorios compartidos por el formulario completo y la edición por tarjeta (Client
   Components sin <form>): CamposNegocio, CamposPago, CamposCuotas, CamposPagoCompleto y CampoObservaciones.
   Reciben valores `v` y errores `err`. Depende de: form-field.jsx, buscador-select.jsx, cliente-campo.jsx,
   lib/schemas/recordatorio-etiquetas.js, form-field.module.css */
