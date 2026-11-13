// src/lib/r2.js
import 'server-only';
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { env } from '@/lib/env';

const CACHE_INMUTABLE = 'public, max-age=31536000, immutable';

let client;
function s3() {
  client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
  });
  return client;
}

/** Claves de objeto (fuente única del formato). */
export const claves = {
  carpeta: (propiedadId) => `propiedades/${propiedadId}/`,
  variante: (propiedadId, imagenId, ancho) =>
    `propiedades/${propiedadId}/${imagenId}-${ancho}.webp`,
  og: (propiedadId, ogId) => `propiedades/${propiedadId}/og-${ogId}.jpg`,
};

/** @param {string} clave */
export const urlPublica = (clave) => `${env.R2_PUBLIC_URL}/${clave}`;

/** URL pública -> clave del objeto, o null si no es de nuestro bucket. */
export function claveDesdeUrl(url) {
  const base = `${env.R2_PUBLIC_URL}/`;
  return typeof url === 'string' && url.startsWith(base) ? url.slice(base.length) : null;
}

/** Sube un objeto inmutable (las claves llevan uuid, nunca se sobrescriben). */
export async function subirObjeto(clave, cuerpo, tipo) {
  await s3().send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: clave,
      Body: cuerpo,
      ContentType: tipo,
      CacheControl: CACHE_INMUTABLE,
    }),
  );
}

/** @returns {Promise<Buffer>} */
export async function leerObjeto(clave) {
  const r = await s3().send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: clave }));
  return Buffer.from(await r.Body.transformToByteArray());
}

/** Borra una lista de claves (en lotes de 1000, límite de S3). Ignora claves vacías. */
export async function borrarObjetos(lista) {
  const keys = lista.filter(Boolean);
  for (let i = 0; i < keys.length; i += 1000) {
    const lote = keys.slice(i, i + 1000).map((Key) => ({ Key }));
    await s3().send(
      new DeleteObjectsCommand({ Bucket: env.R2_BUCKET, Delete: { Objects: lote, Quiet: true } }),
    );
  }
}

/** Borra todo lo que cuelga de un prefijo (ej. la carpeta de una propiedad). */
export async function borrarPrefijo(prefijo) {
  let token;
  do {
    const r = await s3().send(
      new ListObjectsV2Command({
        Bucket: env.R2_BUCKET,
        Prefix: prefijo,
        ContinuationToken: token,
      }),
    );
    await borrarObjetos((r.Contents ?? []).map((o) => o.Key));
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);
}

/* RESUMEN
   Cliente de Cloudflare R2 (S3) solo servidor: claves de objeto (variantes y OG), urlPublica/claveDesdeUrl,
   subirObjeto (Cache-Control inmutable), leerObjeto, borrarObjetos y borrarPrefijo (huérfanos).
   Depende de: @aws-sdk/client-s3, lib/env.js (secretos validados), server-only */
