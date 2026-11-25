// src/components/admin/propiedades-multi.jsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import BuscadorSelect from './buscador-select';
import styles from './cliente-rapido.module.css';
import ff from './form-field.module.css';

/**
 * Elección de varias propiedades: buscador + chips quitables. Envía un `propiedad_id` oculto por cada una.
 * @param {{ propiedades: { id: string, titulo: string }[], iniciales?: string[], error?: string[] }} props
 */
export default function PropiedadesMulti({ propiedades, iniciales = [], error }) {
  const [ids, setIds] = useState(() =>
    iniciales.filter((id) => propiedades.some((p) => p.id === id)),
  );
  /* Cambia en cada elección para vaciar el buscador (remonta) */
  const [vuelta, setVuelta] = useState(0);
  const titulo = (id) => propiedades.find((p) => p.id === id)?.titulo ?? 'Propiedad';
  const opciones = propiedades
    .filter((p) => !ids.includes(p.id))
    .map((p) => ({ id: p.id, texto: p.titulo }));

  function agregar(o) {
    if (!o) return;
    setIds((l) => (l.includes(o.id) ? l : [...l, o.id]));
    setVuelta((n) => n + 1);
  }

  return (
    <div className={`${ff.field} ${styles.multi}`}>
      <BuscadorSelect
        key={vuelta}
        name=""
        label={`Propiedades (${ids.length})`}
        opciones={opciones}
        placeholder="Buscar y sumar propiedades…"
        error={ids.length ? undefined : error}
        hint={ids.length ? undefined : 'Elija una o más.'}
        onChange={agregar}
        className={ff.field}
        labelClassName={ff.label}
        inputClassName={ff.control}
      />
      {ids.length > 0 && (
        <ul className={styles.chips} aria-label="Propiedades elegidas">
          {ids.map((id) => (
            <li key={id} className={styles.chip}>
              <input type="hidden" name="propiedad_id" value={id} />
              <span className={styles.chipTexto}>{titulo(id)}</span>
              <button
                type="button"
                className={styles.chipQuitar}
                onClick={() => setIds((l) => l.filter((x) => x !== id))}
                aria-label={`Quitar ${titulo(id)}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* RESUMEN
   Multiselección de propiedades (Client Component): buscador que se vacía al elegir y chips con botón
   quitar de 44px; cada chip lleva un input oculto `propiedad_id`. Recibe propiedades, iniciales y error.
   Depende de: buscador-select.jsx, cliente-rapido.module.css, form-field.module.css */
