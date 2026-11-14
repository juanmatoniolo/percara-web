// src/components/admin/vinculos-propiedad.jsx
import { KeyRound, Users } from 'lucide-react';
import VinculoForm from './vinculo-form';
import VinculoItem from './vinculo-item';
import styles from './vinculos-propiedad.module.css';

/**
 * Sección "Dueños y compradores" de una propiedad en el panel: dos listas con contacto en un clic y el
 * form para sumar a alguien de la agenda.
 * @param {{ propiedad: any, vinculos: any[], clientes: any[], error?: string }} props
 */
export default function VinculosPropiedad({ propiedad, vinculos, clientes, error }) {
  const grupos = [
    {
      rol: 'propietario',
      titulo: 'Dueños',
      vacio: 'Todavía no se cargó el dueño.',
      Icono: KeyRound,
    },
    {
      rol: 'comprador',
      titulo: 'Posibles compradores',
      vacio: 'Nadie interesado por ahora.',
      Icono: Users,
    },
  ];
  const yaVinculados = new Set(vinculos.map((v) => v.cliente.id));
  const opciones = clientes.filter((c) => !yaVinculados.has(c.id));

  return (
    <section className={styles.section} aria-labelledby="contactos-titulo" id="contactos">
      <h2 id="contactos-titulo" className={styles.title}>
        Dueños y compradores
      </h2>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.cols}>
        {grupos.map(({ rol, titulo, vacio, Icono }) => {
          const lista = vinculos.filter((v) => v.rol === rol);
          return (
            <div key={rol} className={styles.col}>
              <h3 className={styles.sub}>
                <Icono size={18} aria-hidden="true" />
                {titulo}
                <span className={styles.count}>{lista.length}</span>
              </h3>
              {lista.length === 0 ? (
                <p className={styles.empty}>{vacio}</p>
              ) : (
                <ul className={styles.list}>
                  {lista.map((v) => (
                    <VinculoItem
                      key={v.cliente.id}
                      modo="propiedad"
                      cliente={v.cliente}
                      propiedad={propiedad}
                      rol={v.rol}
                      estado={v.estado}
                      notas={v.notas}
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <VinculoForm
        modo="propiedad"
        fijoId={propiedad.id}
        opciones={opciones}
        rolInicial={vinculos.some((v) => v.rol === 'propietario') ? 'comprador' : 'propietario'}
      />
    </section>
  );
}

/* RESUMEN
   Sección del panel con los dueños y los posibles compradores de una propiedad (Server Component): listas
   con WhatsApp/Llamar y seguimiento, más el form para vincular clientes que todavía no están.
   Recibe `propiedad`, `vinculos`, `clientes`, `error`. Depende de: vinculo-item, vinculo-form, module.css */
