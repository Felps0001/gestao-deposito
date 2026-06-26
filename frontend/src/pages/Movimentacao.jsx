import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { formatDate } from "../utils/format";

export default function Movimentacao() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [tipo, setTipo] = useState("entrada");
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [itemRes, movRes] = await Promise.all([
        api.get(`/items/${id}`),
        api.get(`/items/${id}/movimentacoes`),
      ]);
      setItem(itemRes.data);
      setMovimentacoes(movRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    const qtd = Number(quantidade);
    if (!Number.isFinite(qtd) || qtd < 1) {
      setError("Informe uma quantidade maior que zero");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post(`/items/${id}/movimentacao`, {
        tipo,
        quantidade: qtd,
        observacao: observacao.trim() || null,
      });
      setItem(data);
      setQuantidade(1);
      setObservacao("");
      const movRes = await api.get(`/items/${id}/movimentacoes`);
      setMovimentacoes(movRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao registrar movimentacao");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Carregando...</p>;

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>Movimentar estoque</h1>
        <button className="btn btn-ghost" onClick={() => navigate("/")}>
          Voltar
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {item && (
        <div className="stock-summary">
          <div className="stock-info">
            <span className="muted">Item</span>
            <strong>{item.nome}</strong>
          </div>
          <div className="stock-info">
            <span className="muted">Saldo atual</span>
            <strong className="stock-balance">{item.qtde} un.</strong>
          </div>
        </div>
      )}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="field">
            Tipo
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="entrada">Entrada</option>
              <option value="saida">Saida</option>
            </select>
          </label>
          <label className="field field-qtde">
            Quantidade
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </label>
        </div>
        <label className="field">
          Observacao
          <input
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Opcional (ex.: compra, emprestimo...)"
          />
        </label>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Registrando..." : "Registrar movimentacao"}
          </button>
        </div>
      </form>

      <h2 className="section-title">Historico de movimentacoes</h2>
      {movimentacoes.length === 0 ? (
        <p className="muted">Nenhuma movimentacao registrada.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Qtde</th>
              <th>Saldo</th>
              <th>Usuario</th>
              <th>Observacao</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((m) => (
              <tr key={m.id}>
                <td>{formatDate(m.data)}</td>
                <td>
                  <span
                    className={`tag ${
                      m.tipo === "entrada" ? "tag-alt" : "tag-danger"
                    }`}
                  >
                    {m.tipo === "entrada" ? "Entrada" : "Saida"}
                  </span>
                </td>
                <td>{m.quantidade}</td>
                <td>{m.saldoApos}</td>
                <td className="muted">{m.usuario || "-"}</td>
                <td className="muted">{m.observacao || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
