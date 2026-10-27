import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deactivateSupplier,
  reactivateSupplier,
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
  const [changingStatusId, setChangingStatusId] = useState(null);

  // Carrega os fornecedores cadastrados, incluindo os inativos para o administrador.
  async function loadSuppliers() {
    setLoading(true);
    setError("");

    try {
      const data = await getSuppliers();
      const list = Array.isArray(data) ? data : data.results || [];
      setSuppliers(list);
    } catch (err) {
      setError(
        err.message ||
          "Não foi possível carregar os fornecedores. Verifique a conexão com a API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return suppliers.filter((supplier) =>
      [supplier.nome || "", supplier.site_fornecedor || ""].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [suppliers, searchTerm]);

  const totalSuppliers = suppliers.length;
  const suppliersWithSite = suppliers.filter(
    (supplier) => (supplier.site_fornecedor || "").trim() !== ""
  ).length;

  function handleAdd() {
    setEditingSupplier(null);
    setFormData({ ...emptyForm });
    setError("");
    setIsFormOpen(true);
  }

  function handleEdit(supplier) {
    setEditingSupplier(supplier);
    setFormData({
      nome: supplier.nome || "",
      site_fornecedor: supplier.site_fornecedor || "",
    });
    setError("");
    setIsFormOpen(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const nome = formData.nome.trim();
    const site_fornecedor = formData.site_fornecedor.trim();

    if (!nome || !site_fornecedor) {
      setError("Preencha o nome e o site do fornecedor.");
      return;
    }

    const supplierData = { nome, site_fornecedor };
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

  // Inativa ou reativa sem apagar o histórico e os vínculos com produtos.
  async function handleToggleStatus(supplier) {
    const isActive = supplier.ativo !== false;
    const actionLabel = isActive ? "inativar" : "reativar";
    const confirmed = window.confirm(
      `Tem certeza que deseja ${actionLabel} o fornecedor "${supplier.nome}"?`
    );

    if (!confirmed) return;

    setError("");
    setChangingStatusId(supplier.id);

    try {
      if (isActive) {
        await deactivateSupplier(supplier.id);
      } else {
        await reactivateSupplier(supplier.id);
      }
      await loadSuppliers();
    } catch (err) {
      setError(
        err.message ||
          `Não foi possível ${actionLabel} o fornecedor. Verifique sua autenticação.`
      );
    } finally {
      setChangingStatusId(null);
    }
  }

  function handleCancel() {
    setIsFormOpen(false);
    setEditingSupplier(null);
    setFormData({ ...emptyForm });
    setError("");
  }

  function getSupplierUrl(site) {
    if (!site) return "";
    return /^https?:\/\//i.test(site) ? site : `https://${site}`;
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <AdminHeader />

        <main className="suppliers-page">
          <div className="suppliers-page-header">
            <div>
              <p className="dashboard-eyebrow">GERENCIAMENTO</p>
              <h1>Fornecedores</h1>
              <p>Cadastre e gerencie os fornecedores da P&amp;B.</p>
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

          <section className="suppliers-summary">
            <article className="suppliers-summary-card">
              <span>Total de fornecedores</span>
              <strong>{loading ? "..." : totalSuppliers}</strong>
              <small>Fornecedores cadastrados</small>
            </article>

            <article className="suppliers-summary-card">
              <span>Com site cadastrado</span>
              <strong>{loading ? "..." : suppliersWithSite}</strong>
              <small>Com site informado</small>
            </article>
          </section>

          <section className="suppliers-content">
            <div className="suppliers-content-header">
              <div>
                <h2>Lista de fornecedores</h2>
                <p>Consulte os dados dos seus fornecedores.</p>
              </div>
            </div>

            <div className="suppliers-search">
              <label htmlFor="supplier-search">Buscar fornecedor</label>
              <input
                id="supplier-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome ou site..."
              />
            </div>

            <div className="suppliers-table-wrapper">
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Fornecedor</th>
                    <th>Site</th>
                    <th>Situação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="suppliers-empty">
                        Carregando fornecedores...
                      </td>
                    </tr>
                  ) : filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => {
                      const isActive = supplier.ativo !== false;
                      const isChanging = changingStatusId === supplier.id;

                      return (
                        <tr key={supplier.id}>
                          <td>
                            <div className="supplier-name">
                              <div className="supplier-avatar">
                                {(supplier.nome || "?").charAt(0).toUpperCase()}
                              </div>
                              <strong>{supplier.nome}</strong>
                            </div>
                          </td>

                          <td>
                            {supplier.site_fornecedor ? (
                              <a
                                href={getSupplierUrl(supplier.site_fornecedor)}
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
                            <span
                              className={`supplier-status ${
                                isActive ? "active" : "inactive"
                              }`}
                            >
                              {isActive ? "Ativo" : "Inativo"}
                            </span>
                          </td>

                          <td>
                            <div className="supplier-actions">
                              <button
                                type="button"
                                className="supplier-edit-button"
                                onClick={() => handleEdit(supplier)}
                                disabled={isChanging || saving}
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                className={
                                  isActive
                                    ? "supplier-delete-button"
                                    : "supplier-reactivate-button"
                                }
                                onClick={() => handleToggleStatus(supplier)}
                                disabled={isChanging || saving}
                              >
                                {isChanging
                                  ? "Processando..."
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
                      <td colSpan="4" className="suppliers-empty">
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
              {filteredSuppliers.length === 1 ? "fornecedor" : "fornecedores"}
            </div>
          </section>
        </main>
      </div>

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
                <p className="dashboard-eyebrow">GERENCIAMENTO</p>
                <h2 id="supplier-form-title">
                  {editingSupplier ? "Editar fornecedor" : "Novo fornecedor"}
                </h2>
                <p>Informe os dados do fornecedor.</p>
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
                  <label htmlFor="supplier-name">Nome do fornecedor *</label>
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
                  <label htmlFor="supplier-site">Site do fornecedor *</label>
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

                <button type="submit" className="supplier-save-button" disabled={saving}>
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