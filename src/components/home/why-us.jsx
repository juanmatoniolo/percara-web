// src/components/home/why-us.jsx
import { BadgeDollarSign, ClipboardCheck, House, MapPin, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
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

/** Tipo de propiedad destacado que lleva a su categoría (enlace interno con palabra clave). */
const cat = (slug, texto) => (
  <Link href={`/categorias/${slug}`} className={styles.cat}>
    {texto}
  </Link>
);

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

      {/* Pedido del cliente: nombrar todos los tipos aunque se repita (palabras clave para SEO local) */}
      <p className={`${styles.text} reveal`}>
        En <strong>Percara Negocios Inmobiliarios</strong> nos especializamos en la compra y venta
        de {cat('campos', 'campos')}, {cat('quintas', 'quintas')} y{' '}
        {cat('forestaciones', 'forestaciones')} en Chajarí y la región, y también de{' '}
        {cat('casas', 'casas')}, {cat('terrenos', 'terrenos')},{' '}
        {cat('departamentos', 'departamentos')} y {cat('locales-y-oficinas', 'locales comerciales')}
        . Si necesita <strong>comprar</strong>, <strong>vender</strong> o <strong>tasar</strong> un
        campo, una quinta, una forestación, una casa, un terreno, un departamento o un local
        comercial, lo acompañamos en cada paso con transparencia y asesoramiento profesional.
      </p>
    </section>
  );
}

/* RESUMEN
   Bloque "¿Por qué elegirnos?" (Server Component, ancla #sobre-nosotros): título con línea verde,
   5 razones con icono y texto de presentación que nombra campos, quintas, forestaciones, casas, terrenos,
   departamentos y locales (cada uno enlaza a su categoría). Aparición suave al scroll.
   Depende de: components/ui/section-title.jsx, next/link, why-us.module.css, lucide-react */
