// eslint.config.mjs
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

/* eslint-config-next@15 exporta formato clásico (eslintrc): FlatCompat lo convierte a flat config (ESLint 9) */
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  { ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals'),
];

export default eslintConfig;

/* RESUMEN
   Configuración de ESLint 9 (flat) para Next 15: reglas next/core-web-vitals vía FlatCompat e ignora
   carpetas de build. Lo usan `npm run lint` y lint-staged en el pre-commit.
   Depende de: @eslint/eslintrc, eslint-config-next@15 */
