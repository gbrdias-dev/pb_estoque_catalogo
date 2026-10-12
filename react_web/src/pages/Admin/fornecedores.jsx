import { useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";

import "./fornecedores.css";

const initialSuppliers = [
  {
    id: 1,
    nome: "Elegance Acessórios",
    contato: "Mariana Souza",
    email: "contato@elegance.com.br",
    telefone: "(71) 99999-1111",
    observacoes: "Fornecedora de brincos e colares.",
  },
  {
    id: 2,
    nome: "Brilho Dourado",
    contato: "Carlos Oliveira",
    email: "vendas@brilhodourado.com.br",
    telefone: "(71) 98888-2222",
    observacoes: "Especializada em peças douradas.",
  },
  {
    id: 3,
    nome: "Pérolas & Cia",
    contato: "Ana Martins",
    email: "contato@perolasecia.com.br",
    telefone: "(71) 97777-3333",
    observacoes: "Fornece peças com pérolas.",
  },
];

const emptyForm = {
  nome: "",
  contato: "",
  email: "",
  telefone: "",
  observacoes: "",
};

function Suppliers() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");

  // Pesquisa por nome, contato ou e-mail.
  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return suppliers.filter((supplier) =>
      [
        supplier.nome,
        supplier.contato,
        supplier.email,
        supplier.telefone,
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [suppliers, searchTerm]);

  // Abre o formulário para um novo fornecedor.
  function handleAdd() {
    setEditingSupplier(null);
    setFormData({ ...emptyForm });
    setError("");
    setIsFormOpen(true);
  }

  // Abre o formulário preenchido para edição.
  function handleEdit(supplier) {
    setEditingSupplier(supplier);
    setFormData({
      nome: supplier.nome,
      contato: supplier.contato,
      email: supplier.email,
      telefone: supplier.telefone,
      observacoes: supplier.observacoes,
    });
    setError("");
    setIsFormOpen(true);
  }

  // Atualiza os campos do formulário.
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // Salva um novo fornecedor ou atualiza um existente.
  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const nome = formData.nome.trim();
    const contato = formData.contato.trim();
    const email = formData.email.trim();
    const telefone = formData.telefone.trim();

    if (!nome || !contato || !email || !telefone) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    const supplierData = {
      ...formData,
      nome,
      contato,
      email,
      telefone,
      observacoes: formData.observacoes.trim(),
    };

    if (editingSupplier) {
      setSuppliers((current) =>
        current.map((supplier) =>
          supplier.id === editingSupplier.id
            ? { ...supplier, ...supplierData }
            : supplier
        )
      );
    } else {
      setSuppliers((current) => [
        ...current,
        {
          id: Date.now(),
          ...supplierData,
        },
      ]);
    }

    setIsFormOpen(false);
    setEditingSupplier(null);
    setFormData({ ...emptyForm });
  }

  // Exclui um fornecedor após confirmação.
  function handleDelete(id) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este fornecedor?"
    );

    if (!confirmed) return;

    setSuppliers((current) =>
      current.filter((supplier) => supplier.id !== id)
    );
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

          {/* Indicadores */}
          <section className="suppliers-summary">
            <article className="suppliers-summary-card">
              <span>Total de fornecedores</span>
              <strong>{suppliers.length}</strong>
              <small>Fornecedores cadastrados</small>
            </article>

            <article className="suppliers-summary-card">
              <span>Com contato completo</span>
              <strong>
                {
                  suppliers.filter(
                    (supplier) =>
                      supplier.email.trim() &&
                      supplier.telefone.trim()
                  ).length
                }
              </strong>
              <small>Com e-mail e telefone</small>
            </article>
          </section>

          {/* Pesquisa e tabela */}
          <section className="suppliers-content">
            <div className="suppliers-content-header">
              <div>
                <h2>Lista de fornecedores</h2>
                <p>
                  Consulte os dados de contato dos seus parceiros.
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
                placeholder="Buscar por nome, contato ou e-mail..."
              />
            </div>

            <div className="suppliers-table-wrapper">
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Fornecedor</th>
                    <th>Contato</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td>
                          <div className="supplier-name">
                            <div className="supplier-avatar">
                              {supplier.nome
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>{supplier.nome}</strong>
                          </div>
                        </td>

                        <td>{supplier.contato}</td>
                        <td>{supplier.email}</td>
                        <td>{supplier.telefone}</td>

                        <td>
                          <div className="supplier-actions">
                            <button
                              type="button"
                              className="supplier-edit-button"
                              onClick={() => handleEdit(supplier)}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              className="supplier-delete-button"
                              onClick={() =>
                                handleDelete(supplier.id)
                              }
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="suppliers-empty"
                      >
                        Nenhum fornecedor encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="suppliers-table-footer">
              Exibindo {filteredSuppliers.length}{" "}
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
                    maxLength={150}
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome da empresa"
                    required
                  />
                </div>

                <div className="supplier-field">
                  <label htmlFor="supplier-contact">
                    Nome do contato *
                  </label>

                  <input
                    id="supplier-contact"
                    name="contato"
                    type="text"
                    maxLength={150}
                    value={formData.contato}
                    onChange={handleChange}
                    placeholder="Pessoa responsável"
                    required
                  />
                </div>

                <div className="supplier-field">
                  <label htmlFor="supplier-phone">
                    Telefone *
                  </label>

                  <input
                    id="supplier-phone"
                    name="telefone"
                    type="tel"
                    maxLength={30}
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(71) 99999-9999"
                    required
                  />
                </div>

                <div className="supplier-field full-width">
                  <label htmlFor="supplier-email">
                    E-mail *
                  </label>

                  <input
                    id="supplier-email"
                    name="email"
                    type="email"
                    maxLength={254}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contato@fornecedor.com.br"
                    required
                  />
                </div>

                <div className="supplier-field full-width">
                  <label htmlFor="supplier-notes">
                    Observações
                  </label>

                  <textarea
                    id="supplier-notes"
                    name="observacoes"
                    rows="3"
                    maxLength={1000}
                    value={formData.observacoes}
                    onChange={handleChange}
                    placeholder="Informações adicionais sobre o fornecedor..."
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
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="supplier-save-button"
                >
                  {editingSupplier
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