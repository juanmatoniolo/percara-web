// src/components/home/stats-band.jsx
import { Handshake, MapPinned, MessagesSquare, Trophy } from 'lucide-react';
import styles from './stats-band.module.css';

/* Datos confirmados por el cliente (2026-11-12). El contador anima de 0 a `valor` solo con CSS. */
const DATOS = [
  { Icono: Trophy, valor: 10, prefijo: '+', titulo: 'años', texto: 'en el negocio inmobiliario' },
  { Icono: MapPinned, titulo: 'Chajarí', texto: 'y alrededores' },
  { Icono: Handshake, titulo: 'Compra y venta', texto: 'de inmuebles' },
  { Icono: MessagesSquare, titulo: 'Atención', texto: 'personalizada' },
];

export default function StatsBand() {
  return (
    <section className={styles.band} aria-label="Percara en datos">
      <ul className={styles.grid}>
        {DATOS.map(({ Icono, valor, prefijo, titulo, texto }, i) => (
          <li key={titulo} className="reveal" style={{ '--i': i }}>
            <div className={styles.item}>
              <span className={styles.icon} aria-hidden="true">
                <Icono size={24} strokeWidth={1.75} />
              </span>
              <p className={styles.big}>
                {valor ? (
                  <>
                    <span className="sr-only">{`Más de ${valor} ${titulo}`}</span>
                    <span aria-hidden="true">
                      {prefijo}
                      <span className={styles.count} style={{ '--to': valor }} /> {titulo}
                    </span>
                  </>
                ) : (
                  titulo
                )}
              </p>
              <p className={styles.text}>{texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* RESUMEN
   Banda de datos de confianza (Server Component; .reveal va en el <li> para no pisar el hover de la
   tarjeta): +10 años (contador CSS que sube al entrar en
   pantalla, con texto accesible), Chajarí y alrededores, compra y venta, atención personalizada.
   Depende de: stats-band.module.css, styles/animations.css (.reveal), lucide-react */
