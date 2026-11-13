// src/components/home/why-us.jsx
import { BadgeDollarSign, ClipboardCheck, House, MapPin, ShieldCheck } from 'lucide-react';
import SectionTitle from '@/components/ui/section-title';
import styles from './why-us.module.css';

const RAZONES = [
  { Icono: House, titulo: 'Amplia variedad', texto: 'de propiedades en Chajarí y alrededores.' },
  { Icono: ClipboardCheck, titulo: 'Asesoramiento integral', texto: 'en compra y venta.' },
  {
    Icono: BadgeDollarSign,
    titulo: 'Precios competitivos',
    texto: 'y opciones de financiamiento.',
  },
  { Icono: ShieldCheck, titulo: 'Transparencia y seguridad', texto: 'en cada operación.' },
  { Icono: MapPin, titulo: 'Ubicaciones estratégicas', texto: 'para inversión y vivienda.' },
];

export default function WhyUs() {
  return (
    <section id="sobre-nosotros" className={styles.block} aria-labelledby="porque-title">
      <SectionTitle id="porque-title">¿Por qué elegirnos?</SectionTitle>

      <ul className={styles.list}>
        {RAZONES.map(({ Icono, titulo, texto }, i) => (
          <li key={titulo} className={`${styles.item} reveal`} style={{ '--i': i }}>
            <Icono className={styles.icon} size={20} strokeWidth={1.75} aria-hidden="true" />
            <p>
              <strong className={styles.strong}>{titulo}</strong> {texto}
            </p>
          </li>
        ))}
      </ul>

      <p className={`${styles.text} reveal`}>
        En <strong>Percara Negocios Inmobiliarios</strong> ofrecemos una amplia variedad de
        propiedades, desde <strong>casas familiares</strong> y <strong>departamentos</strong> hasta{' '}
        <strong>terrenos</strong> y <strong>locales comerciales</strong>. Si necesita{' '}
        <strong>comprar</strong>, <strong>vender</strong> o tasar un inmueble, lo acompañamos en
        cada paso con transparencia y asesoramiento profesional.
      </p>
    </section>
  );
}

/* RESUMEN
   Bloque "¿Por qué elegirnos?" (Server Component, ancla #sobre-nosotros): título con línea verde,
   5 razones con icono y texto de presentación con palabras clave. Aparición suave al scroll.
   Depende de: components/ui/section-title.jsx, why-us.module.css, lucide-react */
