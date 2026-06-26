import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

export const R2_BUCKET = process.env.R2_BUCKET;
export const R2_PREFIX = (process.env.R2_PREFIX || '').replace(/\/+$/, '');
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

// So habilita o R2 se todas as credenciais estiverem presentes.
// Em desenvolvimento (sem essas variaveis), o backend cai no upload em disco.
export const r2Enabled = Boolean(
  process.env.R2_ENDPOINT &&
    R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
);

export const r2 = r2Enabled
  ? new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null;
