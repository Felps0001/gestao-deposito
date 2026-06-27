import 'dotenv/config';

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const isProduction = NODE_ENV === 'production';

// Segredo do JWT. Em producao e obrigatorio definir JWT_SECRET;
// caso contrario o servidor nao sobe (evita usar um segredo publico conhecido).
const secret = process.env.JWT_SECRET;
if (!secret) {
  if (isProduction) {
    console.error('ERRO: defina JWT_SECRET no ambiente de producao.');
    process.exit(1);
  }
  console.warn('[auth] JWT_SECRET nao definido. Usando segredo de desenvolvimento (NAO use em producao).');
}
export const JWT_SECRET = secret || 'dev-secret';

// Origens permitidas no CORS. Em producao, defina CORS_ORIGIN com a URL do frontend
// (ex.: https://gestao-deposito.pages.dev). Aceita multiplas separadas por virgula.
export const CORS_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
