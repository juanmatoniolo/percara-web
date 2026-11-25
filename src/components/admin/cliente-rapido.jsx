// src/components/admin/cliente-rapido.jsx
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CircleAlert, LoaderCircle, UserPlus, X } from 'lucide-react';
import FormField from './form-field';
import PropiedadesMulti from './propiedades-multi';
import { crearClienteRapido } from '@/actions/clientes';
import { ROLES } from '@/lib/schemas/agenda-etiquetas';
import styles from './cliente-rapido.module.css';
import base from './property-form.module.css';

/** Precarga con lo que se escribió en el buscador: números = celular; si no, "Nombre Apellido". */
function semilla(texto, propiedadInicial) {
  const t = texto.trim();
  const esTel = /^[\d\s()+\-.]{6,}$/.test(t);
  const [nombre = '', ...resto] = esTel ? [] : t.split(/\s+/);
  return {
    nombre,
    apellido: resto.join(' '),
    telefono: esTel ? t : '',
    rol: 'comprador',
    propiedad_ids: propiedadInicial ? [propiedadInicial] : [],
  };
}

/**
 * Diálogo de alta rápida de cliente (nombre, apellido, celular, rol y propiedades). Se monta al abrirse
 * y va por portal al body: su form no puede quedar dentro del form del recordatorio.
 * @param {{ textoInicial?: string, propiedades: { id: string, titulo: string }[],
 *   propiedadInicial?: string, onCreado: (c: { id: string, nombre: string, telefono: string | null },
 *   propiedades: string[]) => void, onCerrar: () => void }} props
 */
export default function ClienteRapido({
  textoInicial = '',
  propiedades,
  propiedadInicial,
  onCreado,
  onCerrar,
}) {
  const ref = useRef(null);
  const [estado, accion, pendiente] = useActionState(async (prev, formData) => {
    const r = await crearClienteRapido(prev, formData);
    if (r.ok) onCreado(r.cliente, r.propiedades);
    return r;
  }, null);

  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal();
  }, []);

  const v = estado?.valores ?? semilla(textoInicial, propiedadInicial);
  const err = estado?.campos ?? {};
  const existente = estado?.existente;
  const campo = (name, label, props = {}) => (
    <FormField
      name={name}
      label={label}
      defaultValue={v[name] ?? ''}
      error={err[name]}
      {...props}
    />
  );

  return createPortal(
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="cliente-rapido-titulo"
      onCancel={(e) => (e.preventDefault(), onCerrar())}
    >
      <header className={styles.head}>
        <h2 id="cliente-rapido-titulo" className={styles.title}>
          <UserPlus size={20} aria-hidden="true" />
          Cliente nuevo
        </h2>
        <button type="button" className={styles.close} onClick={onCerrar} aria-label="Cerrar">
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      <form action={accion} className={styles.grid}>
        {estado?.ok === false && (
          <div className={`${base.alert} ${styles.full}`} role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <p>
              {estado.error}
              {existente && (
                <>
                  {' '}
                  <strong>{existente.nombre}</strong> ({existente.telefono})
                </>
              )}
            </p>
          </div>
        )}
        {existente && (
          <div className={`${styles.full} ${styles.existente}`}>
            <button type="submit" name="usar_id" value={existente.id} className={styles.btnSec}>
              Usar a {existente.nombre}
            </button>
            <button type="submit" name="forzar" value="1" className={styles.btnLink}>
              Es otra persona: crear igual
            </button>
          </div>
        )}

        {campo('nombre', 'Nombre', { required: true, maxLength: 60, autoComplete: 'off' })}
        {campo('apellido', 'Apellido', { required: true, maxLength: 60, autoComplete: 'off' })}
        {campo('telefono', 'Celular', {
          required: true,
          type: 'tel',
          inputMode: 'tel',
          maxLength: 30,
          autoComplete: 'off',
          hint: 'Ej.: 3456 55-3422',
        })}
        {campo('rol', 'Es', {
          as: 'select',
          children: Object.entries(ROLES).map(([k, t]) => (
            <option key={k} value={k}>
              {t}
            </option>
          )),
        })}
        <PropiedadesMulti
          propiedades={propiedades}
          iniciales={v.propiedad_ids}
          error={err.propiedad_ids}
        />

        <footer className={`${styles.full} ${styles.acciones}`}>
          <button type="button" className={styles.btnLink} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" className={base.submit} disabled={pendiente} aria-busy={pendiente}>
            {pendiente ? (
              <LoaderCircle className={base.spin} size={18} aria-hidden="true" />
            ) : (
              <UserPlus size={18} aria-hidden="true" />
            )}
            {pendiente ? 'Guardando…' : 'Crear y elegir'}
          </button>
        </footer>
      </form>
    </dialog>,
    document.body,
  );
}

/* RESUMEN
   Alta rápida de cliente en <dialog> modal (Client Component, portal al body): precarga lo escrito en el
   buscador, crea con crearClienteRapido y avisa si el celular ya existe (usar ese o crear igual). Llama
   onCreado(cliente, propiedades) al guardar. Depende de: actions/clientes.js, form-field.jsx,
   propiedades-multi.jsx, cliente-rapido.module.css, property-form.module.css */
