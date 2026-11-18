// src/components/admin/lugar-select.jsx
'use client';

import { useState } from 'react';
import { PROVINCIAS, canonico, clave } from '@/lib/lugares';
import ff from './form-field.module.css';

const NUEVA = '__nueva__';
const orden = (a, b) => a.localeCompare(b, 'es');

/** Select + "Agregar nueva…" con su campo de texto. Manda el valor final en un input oculto `name`. */
function Elegible({
  name,
  label,
  opciones,
  valor,
  setValor,
  texto,
  setTexto,
  vacio,
  nuevo,
  error,
  required,
}) {
  const id = `f-${name}`;
  const parecida = valor === NUEVA && texto ? canonico(texto, opciones) : null;
  const existe = parecida && opciones.includes(parecida);
  return (
    <div className={ff.field} data-ancho="third">
      <label htmlFor={id} className={ff.label}>
        {label}
        {required && (
          <span className={ff.req} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      <select
        id={id}
        className={ff.control}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        required={required}
        aria-invalid={error?.length ? true : undefined}
        aria-describedby={error?.length ? `${id}-err` : undefined}
      >
        <option value="">{vacio}</option>
        {opciones.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={NUEVA}>{nuevo}</option>
      </select>
      {valor === NUEVA && (
        <input
          className={ff.control}
          aria-label={`${label} nueva`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={80}
          required
          autoFocus
        />
      )}
      {existe && <p className={ff.hint}>Ya existe como «{parecida}»: se usará esa.</p>}
      <input type="hidden" name={name} value={valor === NUEVA ? texto : valor} />
      {error?.length ? (
        <p id={`${id}-err`} className={ff.error}>
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Provincia (lista cerrada) -> localidad -> barrio, eligiendo de lo ya cargado o agregando uno nuevo.
 * Al guardar, el servidor unifica tildes y mayúsculas con lo existente (no conviven "Chajari" y "Chajarí").
 * @param {{ lugares: { localidades: { nombre: string, provincia: string | null }[], barrios: Record<string, string[]> },
 *   valores: { provincia?: string, localidad?: string, barrio?: string }, errores?: Record<string, string[]> }} props
 */
export default function LugarSelect({ lugares, valores, errores = {} }) {
  const deLista = (l) => lugares.localidades.find((x) => clave(x.nombre) === clave(l))?.provincia;
  const [provincia, setProvincia] = useState(
    valores.provincia || deLista(valores.localidad) || (valores.localidad ? '' : 'Entre Ríos'),
  );
  const [localidad, setLocalidad] = useState(valores.localidad ?? '');
  const [locNueva, setLocNueva] = useState('');
  const [barrio, setBarrio] = useState(valores.barrio ?? '');
  const [barrioNuevo, setBarrioNuevo] = useState('');

  /* Localidades de la provincia (y las que aún no tienen provincia), más la actual si no está */
  const locs = lugares.localidades
    .filter((l) => !l.provincia || l.provincia === provincia)
    .map((l) => l.nombre);
  if (localidad && localidad !== NUEVA && !locs.includes(localidad)) locs.push(localidad);
  const barrios = [...(lugares.barrios[localidad] ?? [])];
  if (barrio && barrio !== NUEVA && !barrios.includes(barrio)) barrios.push(barrio);

  return (
    <>
      <div className={ff.field} data-ancho="third">
        <label htmlFor="f-provincia" className={ff.label}>
          Provincia
          <span className={ff.req} aria-hidden="true">
            {' '}
            *
          </span>
        </label>
        <select
          id="f-provincia"
          name="provincia"
          className={ff.control}
          value={provincia}
          onChange={(e) => (setProvincia(e.target.value), setLocalidad(''), setBarrio(''))}
          required
          aria-invalid={errores.provincia?.length ? true : undefined}
        >
          <option value="">Elegir…</option>
          {PROVINCIAS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {errores.provincia?.length ? <p className={ff.error}>{errores.provincia[0]}</p> : null}
      </div>
      <Elegible
        name="localidad"
        label="Localidad"
        opciones={locs.sort(orden)}
        valor={localidad}
        setValor={(v) => (setLocalidad(v), setBarrio(''))}
        texto={locNueva}
        setTexto={setLocNueva}
        vacio="Elegir…"
        nuevo="+ Agregar nueva…"
        error={errores.localidad}
        required
      />
      <Elegible
        name="barrio"
        label="Barrio"
        opciones={barrios.sort(orden)}
        valor={barrio}
        setValor={setBarrio}
        texto={barrioNuevo}
        setTexto={setBarrioNuevo}
        vacio="Sin barrio"
        nuevo="+ Agregar nuevo…"
        error={errores.barrio}
      />
    </>
  );
}

/* RESUMEN
   Ubicación del formulario de propiedad (Client Component): provincia (lista cerrada), localidad y barrio
   encadenados, elegidos de lo ya cargado o con "Agregar nueva…" (avisa si ya existe escrita distinto).
   Envía provincia, localidad y barrio. Recibe `lugares`, `valores`, `errores`.
   Depende de: lib/lugares.js, form-field.module.css */
