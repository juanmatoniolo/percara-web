---
name: apple-style
description: Aplica una estética tipo iOS/Apple (vidrio esmerilado, radios amplios, tipografía grande, microinteracciones suaves) al construir o rediseñar UI del proyecto Percara con CSS Modules y tokens. Usar en cualquier componente visual, página o sección nueva.
---

# Estilo "Apple" para Percara

Objetivo: interfaz serena, premium y formal. Mucho aire, jerarquía clara y movimiento casi imperceptible. Menos es más.

## Reglas del proyecto (siempre)

- CSS Modules + tokens de `src/styles/tokens.css`. Sin Tailwind, sin valores mágicos.
- Primera línea de cada archivo con su ruta; al final bloque `RESUMEN`.
- Orden de media queries: base 320, 480, 768, 1024, 1280, 1536, 1920, landscape, hover/pointer, prefers-color-scheme, prefers-reduced-motion, print.
- Server Components por defecto. Todo efecto visual con CSS puro.

## Principios

1. **Jerarquía por tamaño y peso**, no por color. Un titular grande, un subtítulo suave, un solo CTA.
2. **Espacio generoso**: secciones con `--section-y`, bloques de lectura de 55 a 65 caracteres.
3. **Superficies suaves**: tarjetas blancas (o `--color-surface`) sobre fondo `--color-bg`, sin bordes gruesos.
4. **Radios amplios y continuos**: tarjetas 20 a 28px, botones y chips en píldora, imágenes con el mismo radio que su tarjeta.
5. **Vidrio solo donde flota**: header, hojas modales y barras. No sobre bloques de lectura.
6. **Color con disciplina**: acción en azul de marca (`--color-primary`, #042369); verde de marca (`--color-accent`, #27ae47) solo para detalles (líneas, iconos, badges, halos). Texto verde siempre con `--color-accent-text` (AA). Fondo siempre blanco, sin modo oscuro. El resto, neutros.
7. **Movimiento corto y con propósito**: 200 a 400ms, solo `transform` y `opacity`.

## Tokens adicionales (agregar a tokens.css si faltan)

```css
:root {
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --glass-bg: color-mix(in srgb, var(--color-surface) 72%, transparent);
  --glass-border: color-mix(in srgb, var(--color-text) 8%, transparent);
  --shadow-float:
    0 1px 1px rgb(0 0 0 / 0.04), 0 8px 24px -8px rgb(0 0 0 / 0.12),
    0 24px 48px -24px rgb(0 0 0 / 0.14);
  --ease-spring: cubic-bezier(0.32, 0.72, 0, 1);
  --press-scale: 0.97;
}
```

## Patrones

**Barra / header translúcido**

```css
.bar {
  background: var(--glass-bg);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  backdrop-filter: blur(20px) saturate(1.8);
  border-bottom: 1px solid var(--glass-border);
}
@supports not (backdrop-filter: blur(1px)) {
  .bar {
    background: var(--color-surface);
  }
}
```

**Tarjeta**

```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-float);
  overflow: clip;
  transition:
    transform var(--dur) var(--ease-spring),
    box-shadow var(--dur) var(--ease-spring);
}
@media (hover: hover) {
  .card:hover {
    transform: translateY(-4px) scale(1.01);
  }
}
.card:active {
  transform: scale(var(--press-scale));
}
```

**Botón primario**: píldora, altura mínima `--tap`, `font-weight: 600`, sin sombra dura, `:active` con `scale(var(--press-scale))`.

**Control segmentado** (para Venta/Alquiler): contenedor `--color-surface-alt` con radio píldora; opción activa con fondo `--color-surface` y `--shadow-sm`.

**Lista agrupada** (datos de una propiedad): bloque redondeado, filas separadas por `1px solid var(--color-line)` sin borde en la última, etiqueta a la izquierda y valor a la derecha.

**Hoja (sheet)**: aparece desde abajo en móvil con `translateY` y `--ease-spring`; fondo con scrim al 40%.

**Chips y badges**: píldora, texto `--text-xs`, fondo `--color-accent-soft`, sin borde.

## Tipografía

- Titulares: `--font-display-stack`, tamaño fluido grande, `letter-spacing` levemente negativo, `text-wrap: balance`.
- Cuerpo: `--font-body-stack`, `line-height` 1.6.
- Etiquetas pequeñas en mayúsculas solo para eyebrows (`--tracking-wide`), nunca en párrafos.

## Tema

Tema único claro sobre blanco (decisión de marca). No agregar modo oscuro ni bloques `prefers-color-scheme`. Sombras teñidas de azul de marca, nunca negras.

## Evitar

- Sombras duras u oscuras, bordes de 2px o más, gradientes saturados, íconos de muchos colores.
- Animaciones de más de 500ms, rebotes exagerados, parallax pesado.
- Mayúsculas gritonas, más de dos pesos de fuente por pantalla.

## Accesibilidad (innegociable)

Contraste AA, foco visible, áreas táctiles de 44px, `prefers-reduced-motion` respetado, `@supports` de respaldo para `backdrop-filter`.

## Checklist antes de entregar

- [ ] Solo tokens, sin números mágicos.
- [ ] Hover solo con `@media (hover: hover)`; `:active` presente en elementos táctiles.
- [ ] Movimiento limitado a `transform` y `opacity`.
- [ ] Probado a 320px y a 1440px.
- [ ] Cabecera de ruta y bloque RESUMEN en cada archivo.
