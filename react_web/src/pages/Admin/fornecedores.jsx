
import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../../services/api";

import "./fornecedores.css";

const emptyForm = {
  nome: "",
  site_fornecedor: "",
};

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Carrega os fornecedores cadastrados no banco.
  async function loadSuppliers() {
    setLoading(true);
    setError("");

    try {
      const data = await getSuppliers();
      const list = Array.isArray(data)
        ? data
        : data.results || [];

      setSuppliers(list);
    } catch (err) {
      setError(
        "Não foi possível carregar os fornecedores. Verifique a conexão com a API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  // Pesquisa por nome ou site.
  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return suppliers.filter((supplier) =>
      [
        supplier.nome || "",
        supplier.site_fornecedor || "",
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [suppliers, searchTerm]);

  // Indicadores.
  const totalSuppliers = suppliers.length;

  const suppliersWithSite = suppliers.filter(
    (supplier) => (supplier.site_fornecedor || "").trim() !== ""
  ).length;

  // Abre o formulário para cadastrar.
  function handleAdd() {
    setEditingSupplier(null);
    setFormData({ ...emptyForm });
    setError("");
    setIsFormOpen(true);
  }

  // Abre o formulário para editar.
  function handleEdit(supplier) {
    setEditingSupplier(supplier);

    setFormData({
      nome: supplier.nome || "",
      site_fornecedor: supplier.site_fornecedor || "",
    });

    setError("");
    setIsFormOpen(true);
  }

  // Atualiza os campos.
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // Salva no PostgreSQL através da API Django.
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const nome = formData.nome.trim();
    const site_fornecedor = formData.site_fornecedor.trim();

    if (!nome || !site_fornecedor) {
      setError("Preencha o nome e o site do fornecedor.");
      return;
    }

    const supplierData = {
      nome,
      site_fornecedor,
    };

    setSaving(true);

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
      } else {
        await createSupplier(supplierData);
      }

      setIsFormOpen(false);
      setEditingSupplier(null);
      setFormData({ ...emptyForm });

      await loadSuppliers();
    } catch (err) {
      setError(
        err.message ||
          "Não foi possível salvar o fornecedor. Verifique se você está autenticado."
      );
    } finally {
      setSaving(false);
    }
  }

  // Exclui o fornecedor do banco após confirmação.
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este fornecedor?"
    );

    if (!confirmed) return;

    setError("");
    setDeletingId(id);

    try {
      await deleteSupplier(id);
      await loadSuppliers();
    } catch (err) {
      setError(
        err.message ||
          "Não foi possível excluir o fornecedor. Verifique se você está autenticado e se ele não está vinculado a produtos."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Fecha o formulário sem salvar.
  function handleCancel() {
    setIsFormOpen(false);
    setEditingSupplier(null);
    setFormData({ ...emptyForm });
    setError("");
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <AdminHeader />

        <main className="suppliers-page">
          <div className="suppliers-page-header">
            <div>
              <p className="dashboard-eyebrow">
                GERENCIAMENTO
              </p>

              <h1>Fornecedores</h1>

              <p>
                Cadastre e gerencie os fornecedores da P&B.
              </p>
            </div>

            <button
              type="button"
              className="supplier-add-button"
              onClick={handleAdd}
            >
              + Adicionar fornecedor
            </button>
          </div>

          {error && (
            <p className="supplier-form-error" role="alert">
              {error}
            </p>
          )}

          {/* Indicadores */}
          <section className="suppliers-summary">
            <article className="suppliers-summary-card">
              <span>Total de fornecedores</span>
              <strong>
                {loading ? "..." : totalSuppliers}
              </strong>
              <small>Fornecedores cadastrados</small>
            </article>

            <article className="suppliers-summary-card">
              <span>Com site cadastrado</span>
              <strong>
                {loading ? "..." : suppliersWithSite}
              </strong>
              <small>Com site informado</small>
            </article>
          </section>

          {/* Pesquisa e tabela */}
          <section className="suppliers-content">
            <div className="suppliers-content-header">
              <div>
                <h2>Lista de fornecedores</h2>
                <p>
                  Consulte os dados dos seus fornecedores.
                </p>
              </div>
            </div>

            <div className="suppliers-search">
              <label htmlFor="supplier-search">
                Buscar fornecedor
              </label>

              <input
                id="supplier-search"
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Buscar por nome ou site..."
              />
            </div>

            <div className="suppliers-table-wrapper">
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Fornecedor</th>
                    <th>Site</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="suppliers-empty">
                        Carregando fornecedores...
                      </td>
                    </tr>
                  ) : filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td>
                          <div className="supplier-name">
                            <div className="supplier-avatar">
                              {(supplier.nome || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>{supplier.nome}</strong>
                          </div>
                        </td>

                        <td>
                          {supplier.site_fornecedor ? (
                            <a
                              href={
                                /^https?:\/\//i.test(
                                  supplier.site_fornecedor
                                )
                                  ? supplier.site_fornecedor
                                  : `https://${supplier.site_fornecedor}`
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              {supplier.site_fornecedor}
                            </a>
                          ) : (
                            "Não informado"
                          )}
                        </td>

                        <td>
                          <div className="supplier-actions">
                            <button
                              type="button"
                              className="supplier-edit-button"
                              onClick={() => handleEdit(supplier)}
                              disabled={deletingId === supplier.id}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="supplier-delete-button"
                              onClick={() =>
                                handleDelete(supplier.id)
                              }
                              disabled={deletingId === supplier.id}
                            >
                              {deletingId === supplier.id
                                ? "Excluindo..."
                                : "Excluir"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="suppliers-empty"
                      >
                        {searchTerm
                          ? "Nenhum fornecedor encontrado para essa busca."
                          : "Nenhum fornecedor cadastrado."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="suppliers-table-footer">
              Exibindo {loading ? 0 : filteredSuppliers.length}{" "}
              {filteredSuppliers.length === 1
                ? "fornecedor"
                : "fornecedores"}
            </div>
          </section>
        </main>
      </div>

      {/* Modal de cadastro e edição */}
      {isFormOpen && (
        <div className="supplier-modal-overlay">
          <section
            className="supplier-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="supplier-form-title"
          >
            <div className="supplier-modal-header">
              <div>
                <p className="dashboard-eyebrow">
                  GERENCIAMENTO
                </p>

                <h2 id="supplier-form-title">
                  {editingSupplier
                    ? "Editar fornecedor"
                    : "Novo fornecedor"}
                </h2>

                <p>
                  Informe os dados do fornecedor.
                </p>
              </div>

              <button
                type="button"
                className="supplier-modal-close"
                onClick={handleCancel}
                aria-label="Fechar formulário"
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="supplier-form-grid">
                <div className="supplier-field full-width">
                  <label htmlFor="supplier-name">
                    Nome do fornecedor *
                  </label>

                  <input
                    id="supplier-name"
                    name="nome"
                    type="text"
                    maxLength={100}
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome da empresa"
                    required
                  />
                </div>

                <div className="supplier-field full-width">
                  <label htmlFor="supplier-site">
                    Site do fornecedor *
                  </label>

                  <input
                    id="supplier-site"
                    name="site_fornecedor"
                    type="text"
                    maxLength={255}
                    value={formData.site_fornecedor}
                    onChange={handleChange}
                    placeholder="www.fornecedor.com.br"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="supplier-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="supplier-form-actions">
                <button
                  type="button"
                  className="supplier-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="supplier-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Salvando..."
                    : editingSupplier
                      ? "Salvar alterações"
                      : "Cadastrar fornecedor"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Suppliers;
