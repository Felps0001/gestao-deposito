// Base da API em producao (ex.: https://gestao-deposito-api.onrender.com).
// Em desenvolvimento fica vazio e o proxy do Vite cuida do /api e /uploads.
export const API_BASE = import.meta.env.VITE_API_URL || "";

// Monta a URL completa de um arquivo servido pelo backend (ex.: fotos em /uploads)
export function mediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}
