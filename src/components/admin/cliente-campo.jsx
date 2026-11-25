// src/components/admin/cliente-campo.jsx
'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import BuscadorSelect from './buscador-select';
import ClienteRapido from './cliente-rapido';
import styles from './cliente-rapido.module.css';
import ff from './form-field.module.css';

/**
 * Campo "Cliente" con buscador + alta rápida. Al crear un cliente lo suma a la lista y lo deja elegido.
 * @param {{ name: string, clientes: { id: string, nombre: string, telefono?: string | null }[],
 *   propiedades: { id: string, titulo: string }[], defaultValue?: string, error?: string[],
 *   propiedadActual?: string, onPropiedades?: (ids: string[]) => void }} props
 *   onPropiedades: avisa las propiedades vinculadas (el form puede completar su campo Propiedad)
 */
export default function ClienteCampo({
  name,
  clientes,
  propiedades,
  defaultValue = '',
  error,
  propiedadActual,
  onPropiedades,
}) {
  const [lista, setLista] = useState(clientes);
  /* `n` remonta el buscador para que muestre el cliente recién creado */
  const [elegido, setElegido] = useState({ id: defaultValue, n: 0 });
  const [alta, setAlta] = useState(/** @type {{ texto: string } | null} */ (null));

  function creado(cliente, ids) {
    setLista((l) => (l.some((c) => c.id === cliente.id) ? l : [...l, cliente]));
    setElegido((e) => ({ id: cliente.id, n: e.n + 1 }));
    setAlta(null);
    onPropiedades?.(ids);
  }

  return (
    <div className={ff.field} data-ancho="half">
      <BuscadorSelect
        key={elegido.n}
        name={name}
        label="Cliente"
        opciones={lista.map((c) => ({ id: c.id, texto: c.nombre, detalle: c.telefono ?? '' }))}
        defaultValue={elegido.id}
        placeholder="Nombre o teléfono…"
        error={error}
        onChange={(o) => setElegido((e) => ({ ...e, id: o?.id ?? '' }))}
        onCrear={(texto) => setAlta({ texto })}
        crearTexto="Crear cliente"
        className={ff.field}
        labelClassName={ff.label}
        inputClassName={ff.control}
      />
      <button type="button" className={styles.btnNuevo} onClick={() => setAlta({ texto: '' })}>
        <UserPlus size={18} aria-hidden="true" />
        Cliente nuevo
      </button>
      {alta && (
        <ClienteRapido
          textoInicial={alta.texto}
          propiedades={propiedades}
          propiedadInicial={propiedadActual}
          onCreado={creado}
          onCerrar={() => setAlta(null)}
        />
      )}
    </div>
  );
}

/* RESUMEN
   Campo Cliente del recordatorio (Client Component): buscador de clientes + botón "Cliente nuevo" (y
   "Crear cliente «texto»" sin resultados) que abre el alta rápida; el creado queda elegido y avisa sus
   propiedades. Depende de: buscador-select.jsx, cliente-rapido.jsx, cliente-rapido.module.css */
