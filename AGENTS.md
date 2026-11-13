@'

# Percara Negocios Inmobiliarios

Especificación completa: docs/ESPECIFICACION.md (fuente de verdad; ante duda, manda ella).

## Reglas fijas

- Next.js 15 App Router + React 19, JavaScript puro (.jsx / .js). PROHIBIDO crear .ts / .tsx.
- Supabase + R2 + Sharp + Zod. CSS Modules con tokens (sin Tailwind).
- Server Components por defecto; "use client" solo si es imprescindible.
- Alias `@/*` -> `src/*`. Tipos solo como @typedef JSDoc en src/types/index.js.
- Primera línea de cada archivo: comentario con su ruta. Al final: bloque RESUMEN (2-4 líneas).
- Máx ~150 líneas por componente. Una responsabilidad por archivo.
- Errores devuelven { ok: false, error }, nunca stack traces.
- Mutaciones en Server Actions; cada action y route admin verifica sesión.
- Módulos con secretos importan `server-only`.
- Trabajo por FASES: al terminar una, detenerse y esperar mi OK.
- Respuestas breves: sin introducciones ni despedidas.
  '@ | Set-Content -Encoding UTF8 AGENTS.md

@'
@AGENTS.md
@docs/ESPECIFICACION.md
'@ | Set-Content -Encoding UTF8 CLAUDE.md
