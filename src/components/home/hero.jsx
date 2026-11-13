// src/components/home/hero.jsx
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, MapPin, Search } from 'lucide-react';
import { CATEGORIAS } from '@/lib/queries/categories';
import { iconoCategoria } from '@/lib/categories-meta';
import banner from '../../../public/banner.webp';
import styles from './hero.module.css';

const ACCESOS = ['casas', 'campos', 'terrenos', 'quintas'];

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={`${styles.eyebrow} ${styles.enter}`}>Percara Negocios Inmobiliarios</p>
          <h1 id="hero-title" className={styles.title}>
            Compra y venta de propiedades en <span className={styles.accent}>Chajarí</span> y la
            zona
          </h1>
          <p className={`${styles.lead} ${styles.enter}`} style={{ '--d': 1 }}>
            Casas, campos, terrenos, locales y más, con atención personalizada, compromiso y
            discreción en cada operación.
          </p>

          {/* Solo venta: la inmobiliaria no trabaja alquileres, por eso no hay filtro de operación */}
          <form
            className={`${styles.search} ${styles.enter}`}
            style={{ '--d': 2 }}
            action="/propiedades"
            method="get"
            role="search"
            aria-label="Buscar propiedades en venta"
          >
            <label htmlFor="f-categoria" className="sr-only">
              Tipo de propiedad
            </label>
            <div className={styles.control}>
              <select id="f-categoria" name="categoria" className={styles.select} defaultValue="">
                <option value="">Todos los tipos de propiedad</option>
                {CATEGORIAS.map(({ nombre, slug }) => (
                  <option key={slug} value={slug}>
                    {nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
            </div>
            <button type="submit" className={styles.submit}>
              <Search size={18} aria-hidden="true" />
              <span>Buscar</span>
            </button>
          </form>

          <ul
            className={`${styles.quick} ${styles.enter}`}
            style={{ '--d': 3 }}
            aria-label="Accesos rápidos"
          >
            {ACCESOS.map((slug) => {
              const cat = CATEGORIAS.find((c) => c.slug === slug);
              const Icono = iconoCategoria(slug);
              return (
                <li key={slug}>
                  <Link href={`/categorias/${slug}`} className={styles.chipLink}>
                    <Icono size={16} aria-hidden="true" />
                    {cat.nombre}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.visual}>
          <span className={`${styles.blob} ${styles.blobGreen}`} aria-hidden="true" />
          <span className={`${styles.blob} ${styles.blobBlue}`} aria-hidden="true" />
          <div className={styles.frame}>
            <Image
              src={banner}
              alt="Casa moderna de dos plantas en venta"
              priority
              sizes="(min-width: 1024px) 40rem, 100vw"
              placeholder="blur"
              className={styles.img}
            />
          </div>
          <p className={`${styles.float} ${styles.floatA}`}>
            <strong>+10 años</strong>
            <span>en el negocio</span>
          </p>
          <p className={`${styles.float} ${styles.floatB}`}>
            <MapPin size={16} aria-hidden="true" />
            <span>Chajarí y alrededores</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* RESUMEN
   Hero de inicio (Server Component): eyebrow, H1 SEO local con "Chajarí" subrayado en verde, bajada,
   buscador GET a /propiedades, accesos rápidos a 4 categorías y foto (banner recortado, LCP con priority)
   con halos de marca y dos tarjetas flotantes de vidrio. Depende de: lib/queries/categories.js,
   lib/categories-meta.js, public/banner.webp, hero.module.css */
