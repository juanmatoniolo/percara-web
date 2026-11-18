// src/types/index.js

/**
 * @typedef {Object} Categoria
 * @property {number} [id]
 * @property {string} nombre
 * @property {string} slug
 * @property {number} [orden]
 */

/**
 * @typedef {Object} ImagenPropiedad
 * @property {string} [id]  uuid de la imagen (clave en R2: propiedades/{propiedad}/{id}-{400|900|1600}.webp).
 * @property {string} url   URL de la variante 1600w (R2) o ruta local (/banner.webp).
 * @property {string} alt
 * @property {number} orden 0 = portada.
 * @property {number} ancho
 * @property {number} alto
 * @property {string} [blur] blurDataURL (10px).
 */

/**
 * @typedef {Object} Propiedad
 * @property {string} id
 * @property {string} titulo
 * @property {string} slug
 * @property {string | null} descripcion
 * @property {number | null} precio
 * @property {boolean} mostrar_precio  false = se muestra "Consultar precio".
 * @property {'ARS' | 'USD'} moneda
 * @property {'venta' | 'alquiler'} operacion
 * @property {Categoria} categoria
 * @property {string | null} localidad
 * @property {string | null} direccion
 * @property {number | null} lat
 * @property {number | null} lng
 * @property {number | null} superficie_total
 * @property {number | null} superficie_cubierta
 * @property {number | null} superficie_semicubierta
 * @property {number | null} medida_frente  Metros de frente del terreno.
 * @property {number | null} medida_fondo   Metros de fondo del terreno.
 * @property {number | null} ambientes
 * @property {number | null} dormitorios
 * @property {number | null} banos
 * @property {boolean} cochera
 * @property {ImagenPropiedad[]} imagenes
 * @property {string | null} og_image_url
 * @property {boolean} destacada
 * @property {'borrador' | 'publicada' | 'vendida'} estado
 * @property {string | null} [provincia]  Lista cerrada (lib/lugares.js PROVINCIAS). Migración 009.
 * @property {string | null} [barrio]     Unificado con los ya cargados de su localidad. Migración 009.
 * @property {string | null} [vendida_hasta]  Hasta cuándo se ve una vendida en el sitio (60 días, renovable).
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * Fila única de `configuracion`: datos de contacto editables en /dashboard/configuracion.
 * @typedef {Object} Configuracion
 * @property {string | null} telefono   Como se muestra.
 * @property {string | null} whatsapp   Como se cargó; se normaliza a 549... para wa.me.
 * @property {string | null} email
 * @property {string | null} direccion  Calle y número.
 * @property {string | null} localidad
 * @property {string | null} provincia
 * @property {string | null} maps_url   Link de Google Maps (opcional; si no, se arma con la dirección).
 * @property {string | null} instagram  Usuario, sin @.
 * @property {string | null} facebook   Usuario o nombre de la página.
 * @property {Record<string, string>} redes     (sin uso por ahora)
 * @property {Record<string, string>} horarios  (sin uso por ahora)
 * @property {string | null} texto_sobre_nosotros
 */

/**
 * @typedef {Object} Cliente
 * @property {string} id
 * @property {string} nombre
 * @property {string | null} telefono
 * @property {string | null} telefono_alt
 * @property {string | null} email
 * @property {string | null} localidad
 * @property {string | null} notas        (busca/presupuesto/moneda/categoria_id siguen en la tabla pero
 *                                        ya no se usan: lo que busca va a la Carpeta de pedidos)
 * @property {boolean} activo
 * @property {string | null} dni_cuit
 * @property {string | null} fecha_nacimiento  YYYY-MM-DD
 * @property {string | null} nacionalidad
 * @property {'soltero' | 'casado' | 'divorciado' | 'viudo' | 'union_convivencial' | null} estado_civil
 * @property {string | null} conyuge
 * @property {string | null} profesion
 * @property {string | null} domicilio
 * @property {'whatsapp' | 'telefono' | 'oficina' | 'redes' | 'web' | 'recomendacion' | 'cartel' | 'otro' | null} origen
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * Vínculo cliente <-> propiedad (tabla cliente_propiedades).
 * @typedef {Object} ClientePropiedad
 * @property {string} cliente_id
 * @property {string} propiedad_id
 * @property {'comprador' | 'propietario'} rol
 * @property {'interesado' | 'visita_agendada' | 'visito' | 'oferto' | 'descartada' | null} estado  null si es propietario.
 * @property {string | null} fecha_visita
 * @property {string | null} notas
 */

/**
 * Entrada de la Carpeta de pedidos (agenda personal del admin que la crea).
 * @typedef {Object} Pedido
 * @property {string} id
 * @property {string} titulo
 * @property {string | null} detalle
 * @property {string | null} fecha   YYYY-MM-DD
 * @property {string | null} hora    HH:MM:SS
 * @property {'baja' | 'normal' | 'alta'} prioridad
 * @property {'pendiente' | 'hecho' | 'cancelado'} estado
 * @property {string | null} cliente_id
 * @property {string | null} propiedad_id
 * @property {number | null} categoria_id  Qué busca: tipo de propiedad.
 * @property {number | null} presupuesto   Qué busca: presupuesto máximo.
 * @property {'ARS' | 'USD'} moneda
 * @property {string | null} completado_en
 */

/**
 * Recordatorio: negocio cerrado (cliente + propiedad + cómo se pagó), compartido entre administradores.
 * @typedef {Object} Recordatorio
 * @property {string} id
 * @property {string} titulo
 * @property {string | null} fecha_operacion   YYYY-MM-DD
 * @property {string | null} cliente_id
 * @property {string | null} propiedad_id
 * @property {'contado' | 'financiado' | 'cuotas' | 'permuta' | 'mixto'} forma_pago
 * @property {'efectivo' | 'transferencia' | 'cheque' | 'mixto' | 'otro' | null} medio_pago
 * @property {'ARS' | 'USD'} moneda
 * @property {number | null} monto_total
 * @property {number | null} anticipo
 * @property {number | null} cantidad_cuotas
 * @property {number | null} monto_cuota
 * @property {'ARS' | 'USD' | null} moneda_cuotas
 * @property {string | null} primer_vencimiento   YYYY-MM-DD; las cuotas siguientes son mensuales.
 * @property {'en_curso' | 'finalizado' | 'cancelado'} estado
 * @property {string | null} observaciones
 */

/**
 * @template T
 * @typedef {{ ok: true, data: T } | { ok: false, error: string }} ActionResult
 */

export {};

/* RESUMEN
   Tipos del dominio solo como @typedef JSDoc (Categoria, ImagenPropiedad, Propiedad, Configuracion,
   Cliente, ClientePropiedad, Pedido, Recordatorio, ActionResult). No exporta valores en runtime. Lo usan queries, componentes y actions.
   Depende de: nada */
