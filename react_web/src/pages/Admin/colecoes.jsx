
import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";

import {
  getCollections,
  createCollection,
  updateCollection,
  deactivateCollection,
  reactivateCollection,
} from "../../services/api";

import "./colecoes.css";

const emptyForm = {
  nome: "",
};

function Collections() {
  const [collections, setCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  async function loadCollections() {
    setLoading(true);
    setError("");

    try {
      const data = await getCollections();
      const list = Array.isArray(data) ? data : data.results || [];

      setCollections(list);
    } catch (err) {
      setError(
        err.message ||
          "Não foi possível carregar as coleções. Verifique a conexão com a API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCollections();
  }, []);

  const filteredCollections = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return collections.filter((collection) =>
      (collection.nome || "").toLowerCase().includes(term)
    );
  }, [collections, searchTerm]);

  const totalCollections = collections.length;

  const activeCollections = collections.filter(
    (collection) => collection.ativo !== false
  ).length;

  const inactiveCollections = collections.filter(
    (collection) => collection.ativo === false
  ).length;

  const collectionsWithProducts = collections.filter(
    (collection) =>
      collection.ativo !== false &&
      Number(collection.total_produtos) > 0
  ).length;

  const totalProducts = collections.reduce(
    (total, collection) =>
      total + (Number(collection.total_produtos) || 0),
    0
  );

  function handleAdd() {
    setEditingCollection(null);
    setFormData({ ...emptyForm });
    setError("");
    setIsFormOpen(true);
  }

  function handleEdit(collection) {
    setEditingCollection(collection);
    setFormData({
      nome: collection.nome || "",
    });
    setError("");
    setIsFormOpen(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const nome = formData.nome.trim();

    if (!nome) {
      setError("Informe o nome da coleção.");
      return;
    }

    setSaving(true);

    try {
      if (editingCollection) {
        await updateCollection(editingCollection.id, { nome });
      } else {
        await createCollection({ nome });
      }

      setIsFormOpen(false);
      setEditingCollection(null);
      setFormData({ ...emptyForm });

      await loadCollections();
    } catch (err) {
      setError(
        err.message ||
          "Não foi possível salvar a coleção. Verifique sua autenticação."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(collection) {
    const isActive = collection.ativo !== false;
    const action = isActive ? "inativar" : "reativar";

    const message = isActive
      ? `Deseja inativar a coleção "${collection.nome}"? Os registros e o histórico dos produtos serão preservados.`
      : `Deseja reativar a coleção "${collection.nome}"?`;

    if (!window.confirm(message)) {
      return;
    }

    setError("");
    setActionId(collection.id);

    try {
      if (isActive) {
        await deactivateCollection(collection.id);
      } else {
        await reactivateCollection(collection.id);
      }

      await loadCollections();
    } catch (err) {
      setError(
        err.message ||
          `Não foi possível ${action} a coleção. Verifique sua autenticação.`
      );
    } finally {
      setActionId(null);
    }
  }

  function handleCancel() {
    setIsFormOpen(false);
    setEditingCollection(null);
    setFormData({ ...emptyForm });
    setError("");
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <AdminHeader />

        <main className="collections-page">
          <div className="collections-page-header">
            <div>
              <p className="dashboard-eyebrow">GERENCIAMENTO</p>
              <h1>Coleções</h1>
              <p>
                Cadastre e organize as coleções de produtos da P&amp;B.
              </p>
            </div>

            <button
              type="button"
              className="collection-add-button"
              onClick={handleAdd}
            >
              + Adicionar coleção
            </button>
          </div>

          {error && (
            <div className="collection-alert" role="alert">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Fechar mensagem"
              >
                ×
              </button>
            </div>
          )}

          <section className="collections-summary">
            <article className="collections-summary-card">
              <span>Total de coleções</span>
              <strong>{loading ? "..." : totalCollections}</strong>
              <small>Coleções cadastradas</small>
            </article>

            <article className="collections-summary-card">
              <span>Com produtos</span>
              <strong>{loading ? "..." : collectionsWithProducts}</strong>
              <small>Coleções ativas em utilização</small>
            </article>

            <article className="collections-summary-card">
              <span>Produtos vinculados</span>
              <strong>{loading ? "..." : totalProducts}</strong>
              <small>Total informado pela API</small>
            </article>
          </section>

          <section className="collections-content">
            <div className="collections-content-header">
              <div>
                <h2>Lista de coleções</h2>
                <p>
                  Consulte, edite, inative e reative as coleções cadastradas.
                </p>
              </div>
            </div>

            <div className="collections-search">
              <label htmlFor="collection-search">
                Buscar coleção
              </label>

              <input
                id="collection-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar pelo nome da coleção..."
              />
            </div>

            <div className="collections-table-wrapper">
              <table className="collections-table">
                <thead>
                  <tr>
                    <th>Coleção</th>
                    <th>Produtos vinculados</th>
                    <th>Situação</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="collections-empty">
                        Carregando coleções...
                      </td>
                    </tr>
                  ) : filteredCollections.length > 0 ? (
                    filteredCollections.map((collection) => {
                      const count =
                        Number(collection.total_produtos) || 0;
                      const isActive = collection.ativo !== false;
                      const isActing = actionId === collection.id;

                      return (
                        <tr key={collection.id}>
                          <td>
                            <div className="collection-name">
                              <div className="collection-avatar">
                                {(collection.nome || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <strong>{collection.nome}</strong>
                            </div>
                          </td>

                          <td>
                            <span className="collection-product-count">
                              {count}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`collection-status ${
                                isActive
                                  ? count > 0
                                    ? "in-use"
                                    : "empty"
                                  : "inactive"
                              }`}
                            >
                              {!isActive
                                ? "Inativa"
                                : count > 0
                                  ? "Ativa · Em utilização"
                                  : "Ativa · Sem produtos"}
                            </span>
                          </td>

                          <td>
                            <div className="collection-actions">
                              <button
                                type="button"
                                className="collection-edit-button"
                                onClick={() => handleEdit(collection)}
                                disabled={isActing || saving}
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                className={
                                  isActive
                                    ? "collection-delete-button"
                                    : "collection-reactivate-button"
                                }
                                onClick={() =>
                                  handleToggleStatus(collection)
                                }
                                disabled={isActing || saving}
                                title={
                                  isActive
                                    ? "Inativar coleção"
                                    : "Reativar coleção"
                                }
                              >
                                {isActing
                                  ? "Aguarde..."
                                  : isActive
                                    ? "Inativar"
                                    : "Reativar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="collections-empty">
                        {searchTerm
                          ? "Nenhuma coleção encontrada para essa busca."
                          : "Nenhuma coleção cadastrada."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="collections-table-footer">
              Exibindo {loading ? 0 : filteredCollections.length}{" "}
              {filteredCollections.length === 1
                ? "coleção"
                : "coleções"}
              {!loading && (
                <span>
                  {" "}
                  · {activeCollections} ativas · {inactiveCollections} inativas
                </span>
              )}
            </div>
          </section>
        </main>
      </div>

      {isFormOpen && (
        <div className="collection-modal-overlay">
          <section
            className="collection-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-form-title"
          >
            <div className="collection-modal-header">
              <div>
                <p className="dashboard-eyebrow">GERENCIAMENTO</p>
                <h2 id="collection-form-title">
                  {editingCollection
                    ? "Editar coleção"
                    : "Nova coleção"}
                </h2>
                <p>
                  Informe o nome que identificará a coleção.
                </p>
              </div>

              <button
                type="button"
                className="collection-modal-close"
                onClick={handleCancel}
                aria-label="Fechar formulário"
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="collection-form-grid">
                <div className="collection-field">
                  <label htmlFor="collection-name">
                    Nome da coleção *
                  </label>

                  <input
                    id="collection-name"
                    name="nome"
                    type="text"
                    maxLength={100}
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex.: Coleção Dourada"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="collection-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="collection-form-actions">
                <button
                  type="button"
                  className="collection-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="collection-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Salvando..."
                    : editingCollection
                      ? "Salvar alterações"
                      : "Cadastrar coleção"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Collections;
