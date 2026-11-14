// src/components/admin/configuracion-form.jsx
'use client';

import { useActionState } from 'react';
import { CircleAlert, CircleCheck, LoaderCircle, Save } from 'lucide-react';
import FormField from './form-field';
import { guardarConfiguracion } from '@/actions/settings';
import base from './property-form.module.css';

const s = (v) => (v === null || v === undefined ? '' : String(v));

const ETIQUETAS = {
  telefono: 'Teléfono',
  whatsapp: 'WhatsApp',
  email: 'Email',
  direccion: 'Dirección',
  localidad: 'Localidad',
  provincia: 'Provincia',
  maps_url: 'Link de Google Maps',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

/**
 * Formulario de los datos de contacto de la inmobiliaria (Client Component: useActionState).
 * @param {{ config: import('@/types').Configuracion | null }} props
 */
export default function ConfiguracionForm({ config }) {
  const [estado, accion, pendiente] = useActionState(guardarConfiguracion, null);
  const v = estado?.valores ?? config ?? {};
  const err = estado?.campos ?? {};
  const conError = Object.keys(err).map((k) => ETIQUETAS[k] ?? k);
  const campo = (name, props = {}) => (
    <FormField
      name={name}
      label={ETIQUETAS[name]}
      defaultValue={s(v[name])}
      error={err[name]}
      {...props}
    />
  );

  return (
    <form action={accion} className={base.form}>
      {estado?.ok === false && (
        <div className={base.alert} role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <p>
            {estado.error}
            {conError.length > 0 && <> ({conError.join(', ')})</>}
          </p>
        </div>
      )}
      {estado?.ok && (
        <p className={base.ok} role="status">
          <CircleCheck size={18} aria-hidden="true" />
          Datos guardados. El sitio ya muestra los nuevos.
        </p>
      )}

      <fieldset className={base.group}>
        <legend className={base.legend}>Teléfono y mensajes</legend>
        {campo('whatsapp', {
          type: 'tel',
          required: true,
          maxLength: 30,
          hint: 'Lo usan todos los botones de WhatsApp del sitio. Ej.: 3456 55-3422',
        })}
        {campo('telefono', {
          type: 'tel',
          required: true,
          maxLength: 30,
          hint: 'Se muestra tal cual y lo usa el botón Llamar. Ej.: +54 9 3456 55-3422',
        })}
        {campo('email', { type: 'email', required: true, maxLength: 160, ancho: 'full' })}
      </fieldset>

      <fieldset className={base.group}>
        <legend className={base.legend}>Oficina</legend>
        {campo('direccion', {
          required: true,
          maxLength: 160,
          ancho: 'full',
          hint: 'Calle y número. Ej.: Salvarredy 1919',
        })}
        {campo('localidad', { required: true, maxLength: 80 })}
        {campo('provincia', { required: true, maxLength: 80 })}
        {campo('maps_url', {
          type: 'url',
          maxLength: 500,
          ancho: 'full',
          placeholder: 'https://maps.app.goo.gl/…',
          hint: 'Opcional. En Google Maps: Compartir > Copiar vínculo. Si queda vacío, se busca la dirección.',
        })}
      </fieldset>

      <fieldset className={base.group}>
        <legend className={base.legend}>Redes sociales</legend>
        {campo('instagram', {
          maxLength: 200,
          hint: 'Usuario (sin @) o link del perfil. Vacío = no se muestra.',
        })}
        {campo('facebook', {
          maxLength: 200,
          hint: 'Nombre de la página o link. Vacío = no se muestra.',
        })}
      </fieldset>

      <div className={base.bar}>
        <button type="submit" className={base.submit} disabled={pendiente} aria-busy={pendiente}>
          {pendiente ? (
            <LoaderCircle className={base.spin} size={18} aria-hidden="true" />
          ) : (
            <Save size={18} aria-hidden="true" />
          )}
          {pendiente ? 'Guardando…' : 'Guardar datos'}
        </button>
      </div>
    </form>
  );
}

/* RESUMEN
   Formulario "Datos de la inmobiliaria" (Client Component): WhatsApp, teléfono, email, dirección,
   localidad, provincia, link de Maps y redes. Envía a guardarConfiguracion; errores por campo y aviso
   de guardado. Recibe `config`. Depende de: form-field.jsx, actions/settings.js, property-form.module.css */
