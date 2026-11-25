// src/components/admin/recordatorio-tarjeta.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { CircleCheck, Pencil } from 'lucide-react';
import RecordatorioEditor from './recordatorio-editor';
import styles from './recordatorio-detalle.module.css';

/** Elementos que conservan su propio clic dentro de la tarjeta (links, botones, desplegables). */
const INTERACTIVOS = 'a, button, summary, input, select, textarea, label';

/**
 * Tarjeta de la vista del recordatorio que se edita en el lugar: un clic en cualquier parte (o el lápiz)
 * la pasa a modo edición con todos sus campos.
 * @param {{ seccion: 'negocio' | 'pago' | 'observaciones', nombre: string,
 *   cabecera: import('react').ReactNode, recordatorio: any, clientes?: any[], propiedades?: any[],
 *   children: import('react').ReactNode }} props  children: la vista de solo lectura (Server Component)
 */
export default function RecordatorioTarjeta({
  seccion,
  nombre,
  cabecera,
  recordatorio,
  clientes,
  propiedades,
  children,
}) {
  const [editando, setEditando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const lapiz = useRef(null);
  const volverFoco = useRef(false);

  useEffect(() => {
    if (!editando && volverFoco.current) lapiz.current?.focus();
    volverFoco.current = false;
  }, [editando]);

  function abrir() {
    setGuardado(false);
    setEditando(true);
  }

  function cerrar(ok = false) {
    volverFoco.current = true;
    setGuardado(ok);
    setEditando(false);
  }

  function onClick(e) {
    if (editando || e.target.closest(INTERACTIVOS)) return;
    if (window.getSelection()?.toString()) return; // estaba seleccionando texto para copiar
    abrir();
  }

  return (
    <section
      className={styles.card}
      data-editable=""
      data-editando={editando || undefined}
      aria-label={nombre}
      onClick={onClick}
    >
      <div className={styles.cabeza}>
        {cabecera}
        {guardado && !editando && (
          <p className={styles.guardado} role="status">
            <CircleCheck size={16} aria-hidden="true" />
            Guardado
          </p>
        )}
        {!editando && (
          <button
            ref={lapiz}
            type="button"
            className={styles.lapiz}
            onClick={abrir}
            aria-label={`Editar ${nombre}`}
          >
            <Pencil size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      {editando ? (
        <RecordatorioEditor
          seccion={seccion}
          recordatorio={recordatorio}
          clientes={clientes}
          propiedades={propiedades}
          onCerrar={() => cerrar(false)}
          onGuardado={() => cerrar(true)}
        />
      ) : (
        children
      )}
    </section>
  );
}

/* RESUMEN
   Tarjeta editable de la vista del recordatorio (Client Component): muestra la vista de solo lectura que
   recibe como children y, con un clic en la tarjeta o el lápiz, el editor de su sección; al guardar vuelve
   a la vista (ya actualizada) con aviso "Guardado". Depende de: recordatorio-editor.jsx,
   recordatorio-detalle.module.css */
