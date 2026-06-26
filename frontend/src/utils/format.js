// Formata datas vindas do backend (ISO 8601 do MongoDB) para o formato local pt-BR
export function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR");
}
