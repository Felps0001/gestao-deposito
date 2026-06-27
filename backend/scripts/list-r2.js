// Script de diagnostico: lista os objetos no bucket R2 configurado no .env
// Uso: cd backend && node scripts/list-r2.js
import 'dotenv/config';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2, r2Enabled, R2_BUCKET, R2_PREFIX } from '../r2.js';

if (!r2Enabled) {
  console.log(
    'R2 NAO esta habilitado neste ambiente (credenciais ausentes no .env).\n' +
      'As imagens estao indo para o disco (pasta uploads/), nao para o Cloudflare.'
  );
  process.exit(0);
}

const prefix = R2_PREFIX ? `${R2_PREFIX}/` : undefined;

try {
  const out = await r2.send(
    new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefix })
  );

  const objetos = out.Contents || [];
  console.log(`Bucket: ${R2_BUCKET}  Prefixo: ${prefix || '(raiz)'}`);
  console.log(`Total de arquivos: ${objetos.length}\n`);

  for (const o of objetos) {
    const kb = (o.Size / 1024).toFixed(1);
    console.log(`- ${o.Key}  (${kb} KB)  ${o.LastModified?.toISOString()}`);
  }

  if (objetos.length === 0) {
    console.log('(nenhum arquivo encontrado ainda)');
  }
} catch (err) {
  console.error('Erro ao listar o bucket R2:', err.name, '-', err.message);
  process.exit(1);
}
