// src/components/admin/recordatorio-form.jsx
'use client';

import { useActionState, useState } from 'react';
import { CircleAlert, LoaderCircle, Save } from 'lucide-react';
import { CamposCuotas, CamposNegocio, CamposPago, CampoObservaciones } from './recordatorio-campos';
import { guardarRecordatorio } from '@/actions/recordatorios';
import { CON_CUOTAS, ETIQUETAS_RECORDATORIO } from '@/lib/schemas/recordatorio-etiquetas';
import base from './property-form.module.css';

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
  const [forma, setForma] = useState(v.forma_pago || 'contado');
  const conError = Object.keys(err).map((k) => ETIQUETAS_RECORDATORIO[k] ?? k);

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
        <CamposNegocio v={v} err={err} clientes={clientes} propiedades={propiedades} />
      </fieldset>

      <fieldset className={base.group}>
        <legend className={base.legend}>Cómo se pagó</legend>
        <CamposPago v={v} err={err} onForma={setForma} />
      </fieldset>

      <fieldset
        className={base.group}
        /* .group es display: grid y pisa el atributo hidden: se oculta con estilo y se conservan los valores */
        style={CON_CUOTAS.has(forma) ? undefined : { display: 'none' }}
      >
        <legend className={base.legend}>Cuotas</legend>
        <CamposCuotas v={v} err={err} />
      </fieldset>

      <fieldset className={base.group}>
        <legend className={base.legend}>Observaciones</legend>
        <CampoObservaciones v={v} err={err} />
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
   Formulario completo de Recordatorios (Client Component): negocio, cómo se pagó, cuotas (solo si la forma
   las lleva) y observaciones, con los campos de recordatorio-campos.jsx. Envía a guardarRecordatorio.
   Depende de: recordatorio-campos.jsx, actions/recordatorios.js, lib/schemas/recordatorio-etiquetas.js,
   property-form.module.css */
