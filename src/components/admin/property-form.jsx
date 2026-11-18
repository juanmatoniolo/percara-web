// src/components/admin/property-form.jsx
'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleAlert, LoaderCircle, Save } from 'lucide-react';
import FormField from './form-field';
import FotosNuevas from './fotos-nuevas';
import LugarSelect from './lugar-select';
import { guardarPropiedad } from '@/actions/properties';
import { subirFotos } from '@/lib/subir-fotos';
import { ETIQUETAS } from '@/lib/schemas/propiedad-etiquetas';
import styles from './property-form.module.css';

const s = (v) => (v === null || v === undefined ? '' : String(v));
const NUEVA = { moneda: 'USD', estado: 'borrador', mostrar_precio: true };

const NUMEROS = [
  ['superficie_total', 'Superficie total (m²)', 'Campos: en m² (1 ha = 10.000 m²).'],
  ['superficie_cubierta', 'Superficie cubierta (m²)'],
  ['superficie_semicubierta', 'Superficie semicubierta (m²)'],
  ['medida_frente', 'Frente (m)'],
  ['medida_fondo', 'Fondo (m)'],
  ['ambientes', 'Ambientes'],
  ['dormitorios', 'Habitaciones'],
  ['banos', 'Baños'],
];

/**
 * Alta / edición de propiedad (Client Component: useActionState para errores por campo y envío).
 * @param {{ propiedad?: any, categorias: { id: number, nombre: string }[],
 *   lugares?: { localidades: { nombre: string, provincia: string | null }[], barrios: Record<string, string[]> } }} props
 */
export default function PropertyForm({
  propiedad,
  categorias,
  lugares = { localidades: [], barrios: {} },
}) {
  const router = useRouter();
  const esAlta = !propiedad?.id;
  const [fotos, setFotos] = useState([]);
  const [progreso, setProgreso] = useState(null);
  /* Edición: guardarPropiedad redirige. Alta: crea, sube las fotos elegidas en orden y abre la edición. */
  const [estado, accion, pendiente] = useActionState(async (prev, fd) => {
    const r = await guardarPropiedad(prev, fd);
    if (!esAlta || !r?.ok) return r;
    const { subidas, fallidas } = await subirFotos(r.id, fotos, (actual, total) =>
      setProgreso({ actual, total }),
    );
    const q = new URLSearchParams({ aviso: 'creada', fotos: String(subidas) });
    if (fallidas) q.set('fallidas', String(fallidas));
    router.push(`/dashboard/propiedades/${r.id}?${q}`);
    return { ok: true, creando: true };
  }, null);
  const inicial = propiedad
    ? {
        ...propiedad,
        coordenadas:
          propiedad.lat !== null && propiedad.lng !== null
            ? `${propiedad.lat}, ${propiedad.lng}`
            : '',
      }
    : NUEVA;
  const v = estado?.valores ?? inicial;
  const err = estado?.campos ?? {};
  const check = (k) => v[k] === true || v[k] === 'on';
  const conError = Object.keys(err).map((k) => ETIQUETAS[k] ?? k);
  /* Tras crear queda bloqueado hasta que abre la edición (evita crear dos veces) */
  const ocupado = pendiente || estado?.creando === true;
  const textoBoton = progreso
    ? `Subiendo foto ${progreso.actual} de ${progreso.total}…`
    : ocupado
      ? 'Guardando…'
      : !esAlta
        ? 'Guardar cambios'
        : fotos.length
          ? `Crear propiedad (${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'})`
          : 'Crear propiedad';

  return (
    <form action={accion} className={styles.form}>
      {propiedad?.id && <input type="hidden" name="id" value={propiedad.id} />}

      {estado?.ok === false && (
        <div className={styles.alert} role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <p>
            {estado.error}
            {conError.length > 0 && <> ({conError.join(', ')})</>}
          </p>
        </div>
      )}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Datos principales</legend>
        <FormField
          name="titulo"
          label="Título"
          ancho="full"
          required
          maxLength={140}
          defaultValue={s(v.titulo)}
          error={err.titulo}
          hint="Ej.: Casa de 3 dormitorios con pileta en Barrio Centro"
        />
        <FormField
          name="categoria_id"
          label="Categoría"
          as="select"
          ancho="full"
          required
          defaultValue={s(v.categoria_id)}
          error={err.categoria_id}
        >
          <option value="">Elegir…</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </FormField>
        <FormField
          name="precio"
          label="Precio"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          defaultValue={s(v.precio)}
          error={err.precio}
          hint="Sin puntos ni comas. Ej.: 85000"
        />
        <FormField
          name="moneda"
          label="Moneda"
          as="select"
          defaultValue={s(v.moneda)}
          error={err.moneda}
        >
          <option value="USD">USD (dólares)</option>
          <option value="ARS">ARS (pesos)</option>
        </FormField>
        <label className={styles.check}>
          <input type="checkbox" name="mostrar_precio" defaultChecked={check('mostrar_precio')} />
          <span>
            Mostrar el precio en el sitio
            <small>Si lo destilda, se verá «Consultar precio».</small>
          </span>
        </label>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Ubicación</legend>
        <LugarSelect
          lugares={lugares}
          valores={{ provincia: s(v.provincia), localidad: s(v.localidad), barrio: s(v.barrio) }}
          errores={err}
        />
        <FormField
          name="direccion"
          label="Dirección o zona"
          maxLength={160}
          defaultValue={s(v.direccion)}
          error={err.direccion}
          hint="Ej.: Barrio Naranjal"
        />
        <FormField
          name="coordenadas"
          label="Coordenadas de Google Maps"
          ancho="full"
          maxLength={400}
          defaultValue={s(v.coordenadas)}
          error={err.coordenadas}
          placeholder="-30.762493, -57.980814"
          hint="En Google Maps: clic derecho sobre el lugar y clic en los números para copiarlos. Opcional."
        />
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Características</legend>
        {NUMEROS.map(([name, label, hint]) => (
          <FormField
            key={name}
            name={name}
            label={label}
            ancho="third"
            hint={hint}
            type="number"
            min="0"
            step={/^(superficie|medida)/.test(name) ? 'any' : '1'}
            inputMode="decimal"
            defaultValue={s(v[name])}
            error={err[name]}
          />
        ))}
        <label className={styles.check}>
          <input type="checkbox" name="cochera" defaultChecked={check('cochera')} />
          Tiene cochera
        </label>
        <FormField
          name="descripcion"
          label="Descripción"
          as="textarea"
          ancho="full"
          maxLength={5000}
          defaultValue={s(v.descripcion)}
          error={err.descripcion}
        />
      </fieldset>

      {esAlta && (
        <FotosNuevas fotos={fotos} onChange={setFotos} progreso={progreso} bloqueado={ocupado} />
      )}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Publicación</legend>
        <FormField
          name="estado"
          label="Estado"
          as="select"
          defaultValue={s(v.estado)}
          error={err.estado}
          hint="Publicadas: se ven en el sitio. Vendidas: se ven 60 días con la marca Vendida (renovable)."
        >
          <option value="borrador">Borrador</option>
          <option value="publicada">Publicada</option>
          <option value="vendida">Vendida</option>
        </FormField>
        <label className={styles.check}>
          <input type="checkbox" name="destacada" defaultChecked={check('destacada')} />
          Destacada en la home
        </label>
      </fieldset>

      <div className={styles.bar}>
        <button type="submit" className={styles.submit} disabled={ocupado} aria-busy={ocupado}>
          {ocupado ? (
            <LoaderCircle className={styles.spin} size={18} aria-hidden="true" />
          ) : (
            <Save size={18} aria-hidden="true" />
          )}
          {textoBoton}
        </button>
      </div>
    </form>
  );
}

/* RESUMEN
   Formulario de propiedad (Client Component): datos y precio (con "mostrar precio"), ubicación con
   provincia, localidad y barrio elegidos de lo ya cargado (lugar-select), coordenadas pegadas de Google Maps, características y
   publicación (operación fija: venta). En el alta suma las fotos (fotos-nuevas) y, tras crear, las sube en
   orden con progreso y abre la edición. Errores por campo sin perder lo escrito.
   Depende de: form-field.jsx, fotos-nuevas.jsx, lugar-select.jsx, actions/properties.js, lib/subir-fotos.js,
   lib/schemas/propiedad-etiquetas.js, module.css */
