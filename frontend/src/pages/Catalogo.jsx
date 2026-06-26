import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { formatDate } from "../utils/format";

export default function Catalogo() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(q = "") {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/items", { params: q ? { q } : {} });
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao carregar itens");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load(search.trim());
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja realmente excluir este item?")) return;
    try {
      await api.delete(`/items/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Erro ao excluir");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Catalogo de Itens</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/cadastro")}
        >
          + Novo item
        </button>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar por nome ou observacao..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn">Buscar</button>
        {search && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSearch("");
              load("");
            }}
          >
            Limpar
          </button>
        )}
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : items.length === 0 ? (
        <div className="empty">
          <p>Nenhum item cadastrado ainda.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/cadastro")}
          >
            Cadastrar primeiro item
          </button>
        </div>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <div className="card" key={item.id}>
              <div className="card-img">
                {item.foto ? (
                  <img src={item.foto} alt={item.nome} />
                ) : (
                  <div className="no-img">Sem foto</div>
                )}
                <span className="badge-qtde">{item.qtde} un.</span>
              </div>
              <div className="card-body">
                <h3>{item.nome}</h3>
                <div className="tags">
                  {item.categoria && (
                    <span className="tag">{item.categoria}</span>
                  )}
                  {item.tipoUso && (
                    <span className="tag tag-alt">{item.tipoUso}</span>
                  )}
                </div>
                {item.observacoes && <p className="obs">{item.observacoes}</p>}
                <div className="card-dates">
                  <span>Cadastro: {formatDate(item.dataCadastro)}</span>
                  <span>Alteracao: {formatDate(item.dataAlteracao)}</span>
                </div>
              </div>
              <div className="card-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => navigate(`/movimentacao/${item.id}`)}
                >
                  Movimentar
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => navigate(`/cadastro/${item.id}`)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
