import { useEffect, useState } from "react";
import api from "../api";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/categories");
      setCategorias(data);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/categories", {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
      });
      setNome("");
      setDescricao("");
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja realmente excluir esta categoria?")) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao excluir");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Categorias</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="field field-grow">
            Nova categoria *
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Ferramentas"
              required
            />
          </label>
          <label className="field field-grow">
            Descricao
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Opcional"
            />
          </label>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : categorias.length === 0 ? (
        <div className="empty">
          <p>Nenhuma categoria cadastrada ainda.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descricao</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td className="muted">{c.descricao || "-"}</td>
                <td className="td-actions">
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(c.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
