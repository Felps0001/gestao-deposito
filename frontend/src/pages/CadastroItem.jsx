import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { formatDate } from "../utils/format";

const TIPOS_USO = ["Consumo", "Permanente", "Emprestimo", "Descartavel"];

export default function CadastroItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    qtde: 0,
    categoria: "",
    tipoUso: "",
    observacoes: "",
  });
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fotoAtual, setFotoAtual] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategorias(data.map((c) => c.nome)))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/items/${id}`)
      .then(({ data }) => {
        setForm({
          nome: data.nome || "",
          qtde: data.qtde || 0,
          categoria: data.categoria || "",
          tipoUso: data.tipoUso || "",
          observacoes: data.observacoes || "",
        });
        setFotoAtual(data.foto);
      })
      .catch((err) =>
        setError(err.response?.data?.error || "Erro ao carregar item"),
      );
  }, [id, isEdit]);

  function loadHistorico() {
    if (!isEdit) return;
    api
      .get(`/items/${id}/historico`)
      .then(({ data }) => setHistorico(data))
      .catch(() => setHistorico([]));
  }

  useEffect(() => {
    loadHistorico();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFile(e) {
    const file = e.target.files[0];
    setFoto(file || null);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const data = new FormData();
    data.append("nome", form.nome);
    // A quantidade so e enviada no cadastro; na edicao ela so muda via Movimentar
    if (!isEdit) data.append("qtde", form.qtde);
    data.append("categoria", form.categoria);
    data.append("tipoUso", form.tipoUso);
    data.append("observacoes", form.observacoes);
    if (foto) data.append("foto", foto);

    try {
      if (isEdit) {
        await api.put(`/items/${id}`, data);
      } else {
        await api.post("/items", data);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>{isEdit ? "Editar item" : "Cadastrar item"}</h1>
        <button className="btn btn-ghost" onClick={() => navigate("/")}>
          Voltar
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="field field-grow">
            Nome *
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              autoFocus
            />
          </label>
          <label className="field field-qtde">
            Quantidade
            {isEdit ? (
              <div className="qtde-locked">
                <strong>{form.qtde} un.</strong>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => navigate(`/movimentacao/${id}`)}
                >
                  Movimentar
                </button>
              </div>
            ) : (
              <input
                type="number"
                name="qtde"
                min="0"
                value={form.qtde}
                onChange={handleChange}
              />
            )}
          </label>
        </div>

        {isEdit && (
          <p className="muted field-hint">
            A quantidade so pode ser alterada pela tela de Movimentar, para
            ficar registrada no historico de estoque.
          </p>
        )}

        <div className="form-row">
          <label className="field">
            Categoria
            <input
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              list="categorias"
              placeholder="Selecione ou digite"
            />
            <datalist id="categorias">
              {categorias.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="field">
            Tipo de uso
            <input
              name="tipoUso"
              value={form.tipoUso}
              onChange={handleChange}
              list="tipos"
              placeholder="Selecione ou digite"
            />
            <datalist id="tipos">
              {TIPOS_USO.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </label>
        </div>

        <label className="field">
          Observacoes
          <textarea
            name="observacoes"
            rows="4"
            value={form.observacoes}
            onChange={handleChange}
          />
        </label>

        <label className="field">
          Foto
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>

        {(preview || fotoAtual) && (
          <div className="photo-preview">
            <img src={preview || fotoAtual} alt="Pre-visualizacao" />
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving
              ? "Salvando..."
              : isEdit
                ? "Salvar alteracoes"
                : "Cadastrar"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate("/")}
          >
            Cancelar
          </button>
        </div>
      </form>

      {isEdit && (
        <>
          <h2 className="section-title">Historico de alteracoes</h2>
          {historico.length === 0 ? (
            <p className="muted">Nenhuma alteracao registrada.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Acao</th>
                  <th>Alteracoes</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h) => (
                  <tr key={h.id}>
                    <td>{formatDate(h.data)}</td>
                    <td>
                      <span
                        className={`tag ${
                          h.acao === "criado" ? "tag-alt" : ""
                        }`}
                      >
                        {h.acao === "criado" ? "Criado" : "Atualizado"}
                      </span>
                    </td>
                    <td>
                      {h.alteracoes.length === 0 ? (
                        <span className="muted">-</span>
                      ) : (
                        <ul className="change-list">
                          {h.alteracoes.map((a, i) => (
                            <li key={i}>
                              <strong>{a.campo}:</strong>{" "}
                              <span className="muted">{a.de || "(vazio)"}</span>{" "}
                              &rarr; {a.para || "(vazio)"}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="muted">{h.usuario || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
