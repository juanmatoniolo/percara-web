// src/components/home/cta-band.jsx
import { Phone } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/icons';
import { CONTACT, whatsappUrl } from '@/lib/site-config';
import styles from './cta-band.module.css';

const MENSAJE = 'Hola, quisiera vender o tasar una propiedad.';

export default function CtaBand() {
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
            href={whatsappUrl(MENSAJE)}
            className={styles.primary}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={20} />
            Escribir por WhatsApp
          </a>
          <a href={`tel:${CONTACT.telefonoE164}`} className={styles.secondary}>
            <Phone size={18} aria-hidden="true" />
            {CONTACT.telefono}
          </a>
        </div>
      </div>
    </section>
  );
}

/* RESUMEN
   Banda de llamado a la acción (Server Component): tarjeta azul de marca con anillos decorativos,
   título "¿Quiere vender o tasar su propiedad?" y CTAs a WhatsApp (mensaje prellenado) y teléfono.
   Depende de: components/ui/icons.jsx, lib/site-config.js, cta-band.module.css */
