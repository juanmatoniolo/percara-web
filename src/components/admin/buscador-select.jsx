// src/components/admin/buscador-select.jsx
'use client';

import { useId, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import styles from './buscador-select.module.css';

const MAX_RESULTADOS = 8;

/** Minúsculas y sin tildes: "Gómez" encuentra "gomez". */
const normalizar = (t) =>
  String(t ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
const digitos = (t) => String(t ?? '').replace(/\D/g, '');

/**
 * Select con buscador (combobox accesible): se escribe parte del nombre, teléfono o título y se elige de
 * la lista. Envía el id elegido en un input oculto con `name`. Teclado: flechas, Enter y Escape.
 * @param {{
 *   name: string, label: string, opciones: { id: string, texto: string, detalle?: string }[],
 *   defaultValue?: string, placeholder?: string, error?: string[], hint?: string,
 *   className?: string, labelClassName?: string, inputClassName?: string,
 *   ancho?: 'full' | 'half' | 'third'
 * }} props
 */
export default function BuscadorSelect({
  name,
  label,
  opciones,
  defaultValue = '',
  placeholder = 'Escriba para buscar…',
  error,
  hint,
  className = '',
  labelClassName = '',
  inputClassName = '',
  ancho,
}) {
  const uid = useId();
  const inicial = opciones.find((o) => o.id === defaultValue) ?? null;
  const [elegida, setElegida] = useState(inicial);
  const [texto, setTexto] = useState(inicial?.texto ?? '');
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);

  const resultados = useMemo(() => {
    const q = normalizar(texto.trim());
    const qd = digitos(texto);
    if (!q) return opciones.slice(0, MAX_RESULTADOS);
    return opciones
      .filter(
        (o) =>
          normalizar(`${o.texto} ${o.detalle ?? ''}`).includes(q) ||
          (qd.length >= 3 && digitos(o.detalle).includes(qd)),
      )
      .slice(0, MAX_RESULTADOS);
  }, [texto, opciones]);

  function elegir(o) {
    setElegida(o);
    setTexto(o.texto);
    setAbierto(false);
  }

  function limpiar() {
    setElegida(null);
    setTexto('');
    setAbierto(true);
    setActivo(0);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setAbierto(true);
      const n = resultados.length || 1;
      setActivo((a) => (e.key === 'ArrowDown' ? (a + 1) % n : (a - 1 + n) % n));
    } else if (e.key === 'Enter' && abierto && resultados[activo]) {
      e.preventDefault(); // elige en vez de enviar el formulario
      elegir(resultados[activo]);
    } else if (e.key === 'Escape') {
      setAbierto(false);
    }
  }

  const sinElegir = texto.trim() !== '' && !elegida;
  const descr = [hint && `${uid}-hint`, (error?.length || sinElegir) && `${uid}-err`]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.wrap} ${className}`} data-ancho={ancho}>
      <label htmlFor={`${uid}-in`} className={labelClassName}>
        {label}
      </label>
      <input type="hidden" name={name} value={elegida?.id ?? ''} />
      <div className={styles.box}>
        <Search size={18} aria-hidden="true" className={styles.lupa} />
        <input
          id={`${uid}-in`}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={abierto}
          aria-controls={`${uid}-list`}
          aria-activedescendant={abierto && resultados[activo] ? `${uid}-o${activo}` : undefined}
          aria-invalid={error?.length || sinElegir ? true : undefined}
          aria-describedby={descr || undefined}
          className={`${inputClassName} ${styles.input}`}
          placeholder={placeholder}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setElegida(null);
            setAbierto(true);
            setActivo(0);
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setAbierto(false)}
          onKeyDown={onKeyDown}
        />
        {texto && (
          <button
            type="button"
            className={styles.clear}
            onClick={limpiar}
            aria-label={`Borrar ${label}`}
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
        <ul
          id={`${uid}-list`}
          role="listbox"
          aria-label={label}
          className={styles.list}
          hidden={!abierto}
        >
          {resultados.length === 0 ? (
            <li className={styles.none}>Sin resultados</li>
          ) : (
            resultados.map((o, i) => (
              <li
                key={o.id}
                id={`${uid}-o${i}`}
                role="option"
                aria-selected={i === activo}
                className={styles.opt}
                onMouseDown={(e) => e.preventDefault() /* que el input no pierda el foco */}
                onClick={() => elegir(o)}
              >
                <span className={styles.texto}>{o.texto}</span>
                {o.detalle && <span className={styles.detalle}>{o.detalle}</span>}
              </li>
            ))
          )}
        </ul>
      </div>
      {hint && (
        <p id={`${uid}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {(error?.length || sinElegir) && (
        <p id={`${uid}-err`} className={styles.error}>
          {error?.[0] ?? 'Elija una opción de la lista.'}
        </p>
      )}
    </div>
  );
}

/* RESUMEN
   Combobox con buscador (Client Component): filtra sin tildes por texto, detalle y dígitos de teléfono,
   muestra hasta 8 resultados, navega con teclado y guarda el id elegido en un input oculto `name`.
   Recibe opciones { id, texto, detalle } y clases/ancho para integrarse al form. Depende de: buscador-select.module.css, lucide-react */
