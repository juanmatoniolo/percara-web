// src/lib/schemas/propiedad-etiquetas.js

/** Nombres visibles de cada campo del formulario de propiedad (para el aviso general de errores). */
export const ETIQUETAS = {
  titulo: 'Título',
  descripcion: 'Descripción',
  precio: 'Precio',
  moneda: 'Moneda',
  categoria_id: 'Categoría',
  localidad: 'Localidad',
  direccion: 'Dirección',
  coordenadas: 'Coordenadas',
  superficie_total: 'Superficie total',
  superficie_cubierta: 'Superficie cubierta',
  ambientes: 'Ambientes',
  dormitorios: 'Habitaciones',
  banos: 'Baños',
  estado: 'Estado',
};

/* RESUMEN
   Etiquetas legibles de los campos de propiedad. Separado del schema para no mandar Zod al navegador:
   lo importa el formulario (Client Component). Depende de: nada */
