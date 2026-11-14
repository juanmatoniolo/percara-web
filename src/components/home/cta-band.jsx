// src/components/home/cta-band.jsx
import { Phone } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/icons';
import { whatsappUrl } from '@/lib/contacto';
import { getContacto } from '@/lib/queries/settings';
import styles from './cta-band.module.css';

const MENSAJE = 'Hola, quisiera vender o tasar una propiedad.';

export default async function CtaBand() {
  const contacto = await getContacto();

  return (
    <section className={styles.wrap} aria-labelledby="cta-title">
      <div className={`${styles.card} reveal`}>
        <span className={`${styles.ring} ${styles.ringA}`} aria-hidden="true" />
        <span className={`${styles.ring} ${styles.ringB}`} aria-hidden="true" />

        <div className={styles.copy}>
          <p className={styles.eyebrow}>Vender con Percara</p>
          <h2 id="cta-title" className={styles.title}>
            ¿Quiere vender o tasar su propiedad?
          </h2>
          <p className={styles.text}>
            Lo asesoramos en cada paso, con atención personalizada y más de 10 años en el mercado de
            Chajarí y alrededores.
          </p>
        </div>

        <div className={styles.actions}>
          <a
            href={whatsappUrl(contacto, MENSAJE)}
            className={styles.primary}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={20} />
            Escribir por WhatsApp
          </a>
          <a href={contacto.telefonoHref} className={styles.secondary}>
            <Phone size={18} aria-hidden="true" />
            {contacto.telefono}
          </a>
        </div>
      </div>
    </section>
  );
}

/* RESUMEN
   Banda de llamado a la acción (Server Component): tarjeta azul de marca con anillos decorativos,
   título "¿Quiere vender o tasar su propiedad?" y CTAs a WhatsApp (mensaje prellenado) y teléfono.
   Depende de: components/ui/icons.jsx, lib/contacto.js, lib/queries/settings.js, cta-band.module.css */
