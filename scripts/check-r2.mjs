import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const e = process.env;
const faltan = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_URL',
].filter((k) => !e[k]);
if (faltan.length) {
  console.log('Faltan variables:', faltan.join(', '));
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: e.R2_ACCESS_KEY_ID, secretAccessKey: e.R2_SECRET_ACCESS_KEY },
});
const Key = 'test/check.txt';

try {
  await s3.send(
    new PutObjectCommand({ Bucket: e.R2_BUCKET, Key, Body: 'ok', ContentType: 'text/plain' }),
  );
  console.log('Escritura: OK');
  const r = await fetch(`${e.R2_PUBLIC_URL}/${Key}`);
  console.log('Lectura publica:', r.status, r.ok ? 'OK' : 'ERROR');
  await s3.send(new DeleteObjectCommand({ Bucket: e.R2_BUCKET, Key }));
  console.log('Borrado: OK');
} catch (err) {
  console.log('R2 ERROR:', err.name);
}
