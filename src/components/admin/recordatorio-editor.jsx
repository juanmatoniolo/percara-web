// src/components/admin/recordatorio-editor.jsx
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { CircleAlert, LoaderCircle, Save } from 'lucide-react';
import { CamposNegocio, CamposPagoCompleto, CampoObservaciones } from './recordatorio-campos';
import { guardarSeccionRecordatorio } from '@/actions/recordatorios';
import { ETIQUETAS_RECORDATORIO } from '@/lib/schemas/recordatorio-etiquetas';
import base from './property-form.module.css';
import styles from './recordatorio-detalle.module.css';

/**
 * Formulario de una sola tarjeta del recordatorio. Se monta al abrirse (estado limpio cada vez), enfoca
 * el primer campo y se cierra con Escape o Cancelar.
 * @param {{ seccion: 'negocio' | 'pago' | 'observaciones', recordatorio: any,
 *   clientes?: any[], propiedades?: any[], onCerrar: () => void, onGuardado: () => void }} props
 */
export default function RecordatorioEditor({
  seccion,
  recordatorio,
  clientes = [],
  propiedades = [],
  onCerrar,
  onGuardado,
}) {
  const ref = useRef(null);
  const [estado, accion, pendiente] = useActionState(async (prev, formData) => {
    const r = await guardarSeccionRecordatorio(prev, formData);
    if (r.ok) onGuardado();
    return r;
  }, null);
  const v = estado?.valores ?? recordatorio;
  const err = estado?.campos ?? {};
  const conError = Object.keys(err).map((k) => ETIQUETAS_RECORDATORIO[k] ?? k);

  useEffect(() => {
    ref.current?.querySelector('input:not([type="hidden"]), select, textarea')?.focus();
  }, []);

  function onKeyDown(e) {
    /* Escape cierra, salvo que venga del alta rápida (portal) o de una lista abierta del buscador */
    if (e.key !== 'Escape' || !e.currentTarget.contains(e.target)) return;
    if (e.target.getAttribute('aria-expanded') === 'true') return;
    e.preventDefault();
    onCerrar();
  }

  return (
    <form ref={ref} action={accion} className={styles.editor} onKeyDown={onKeyDown}>
      <input type="hidden" name="id" value={recordatorio.id} />
      <input type="hidden" name="seccion" value={seccion} />
      {estado?.ok === false && (
        <div className={`${base.alert} ${styles.full}`} role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <p>
            {estado.error}
            {conError.length > 0 && <> ({conError.join(', ')})</>}
          </p>
        </div>
      )}

      {seccion === 'negocio' && (
        <CamposNegocio v={v} err={err} clientes={clientes} propiedades={propiedades} />
      )}
      {seccion === 'pago' && <CamposPagoCompleto v={v} err={err} />}
      {seccion === 'observaciones' && <CampoObservaciones v={v} err={err} />}

      <div className={`${styles.full} ${styles.acciones}`}>
        <button type="button" className={styles.cancelar} onClick={onCerrar}>
          Cancelar
        </button>
        <button type="submit" className={base.submit} disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? (
            <LoaderCircle className={base.spin} size={18} aria-hidden="true" />
          ) : (
            <Save size={18} aria-hidden="true" />
          )}
          {pendiente ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

/* RESUMEN
   Edición en el lugar de una tarjeta del recordatorio (Client Component): arma los campos de la sección
   (negocio, pago con cuotas u observaciones), guarda con guardarSeccionRecordatorio y avisa onGuardado.
   Depende de: recordatorio-campos.jsx, actions/recordatorios.js, property-form.module.css,
   recordatorio-detalle.module.css */
