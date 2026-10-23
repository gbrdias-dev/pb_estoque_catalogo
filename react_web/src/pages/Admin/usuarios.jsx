import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";
import { getUsers, createUser } from "../../services/api";
import "./usuarios.css";

const emptyForm = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
};

function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(
        err.message ||
          "Não foi possível carregar os usuários. Verifique sua autenticação e a conexão com a API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) =>
      [user.nome || "", user.email || ""].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [users, searchTerm]);

  function handleAdd() {
    setFormData({ ...emptyForm });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const nome = formData.nome.trim();
    const email = formData.email.trim().toLowerCase();

    if (!nome || !email || !formData.senha || !formData.confirmarSenha) {
      setError("Preencha todos os campos.");
      return;
    }

    if (formData.senha.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setSaving(true);

    try {
      await createUser({
        nome,
        email,
        senha: formData.senha,
      });

      setIsFormOpen(false);
      setFormData({ ...emptyForm });
      setSuccess("Usuário administrativo cadastrado com sucesso.");
      await loadUsers();
    } catch (err) {
      const apiError = err.data;
      let message = err.message || "Não foi possível cadastrar o usuário.";

      if (apiError && typeof apiError === "object") {
        if (apiError.email) message = `E-mail: ${apiError.email.join(" ")}`;
        else if (apiError.senha) message = `Senha: ${apiError.senha.join(" ")}`;
        else if (apiError.nome) message = `Nome: ${apiError.nome.join(" ")}`;
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setIsFormOpen(false);
    setFormData({ ...emptyForm });
    setError("");
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <AdminHeader />

        <main className="users-page">
          <div className="users-page-header">
            <div>
              <p className="dashboard-eyebrow">GERENCIAMENTO</p>
              <h1>Usuários administrativos</h1>
              <p>Cadastre e consulte as contas com acesso ao painel da P&amp;B.</p>
            </div>

            <button
              type="button"
              className="users-add-button"
              onClick={handleAdd}
            >
              + Adicionar usuário
            </button>
          </div>

          {error && !isFormOpen && (
            <p className="users-message users-error" role="alert">{error}</p>
          )}
          {success && (
            <p className="users-message users-success" role="status">{success}</p>
          )}

          <section className="users-summary">
            <article className="users-summary-card">
              <span>Total de usuários</span>
              <strong>{loading ? "..." : users.length}</strong>
              <small>Contas administrativas cadastradas</small>
            </article>
          </section>

          <section className="users-content">
            <div className="users-content-header">
              <div>
                <h2>Lista de usuários</h2>
                <p>As senhas não são exibidas nesta lista.</p>
              </div>
            </div>

            <div className="users-search">
              <label htmlFor="users-search-input">Buscar usuário</label>
              <input
                id="users-search-input"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome ou e-mail..."
              />
            </div>

            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="3" className="users-empty">Carregando usuários...</td></tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="users-name">
                            <div className="users-avatar">
                              {(user.nome || "?").charAt(0).toUpperCase()}
                            </div>
                            <strong>{user.nome}</strong>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td><span className="users-role">Administrador</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="users-empty">
                        {searchTerm
                          ? "Nenhum usuário encontrado para essa busca."
                          : "Nenhum usuário cadastrado."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="users-table-footer">
              Exibindo {loading ? 0 : filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "usuário" : "usuários"}
            </div>
          </section>
        </main>
      </div>

      {isFormOpen && (
        <div className="users-modal-overlay">
          <section
            className="users-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="users-form-title"
          >
            <div className="users-modal-header">
              <div>
                <p className="dashboard-eyebrow">GERENCIAMENTO</p>
                <h2 id="users-form-title">Novo usuário administrativo</h2>
                <p>Preencha os dados para criar uma conta com acesso ao painel.</p>
              </div>
              <button
                type="button"
                className="users-modal-close"
                onClick={handleCancel}
                aria-label="Fechar formulário"
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="users-form-grid">
                <div className="users-field full-width">
                  <label htmlFor="users-name">Nome completo *</label>
                  <input
                    id="users-name"
                    name="nome"
                    type="text"
                    maxLength={100}
                    autoComplete="name"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome do usuário"
                    required
                  />
                </div>

                <div className="users-field full-width">
                  <label htmlFor="users-email">E-mail *</label>
                  <input
                    id="users-email"
                    name="email"
                    type="email"
                    maxLength={255}
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="usuario@exemplo.com"
                    required
                  />
                </div>

                <div className="users-field">
                  <label htmlFor="users-password">Senha *</label>
                  <input
                    id="users-password"
                    name="senha"
                    type="password"
                    minLength={8}
                    autoComplete="new-password"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="Mínimo de 8 caracteres"
                    required
                  />
                </div>

                <div className="users-field">
                  <label htmlFor="users-confirm-password">Confirmar senha *</label>
                  <input
                    id="users-confirm-password"
                    name="confirmarSenha"
                    type="password"
                    minLength={8}
                    autoComplete="new-password"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    placeholder="Repita a senha"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="users-message users-error" role="alert">{error}</p>
              )}

              <div className="users-form-note">
                A senha será armazenada com hash e não poderá ser consultada pela lista.
              </div>

              <div className="users-form-actions">
                <button
                  type="button"
                  className="users-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="users-save-button"
                  disabled={saving}
                >
                  {saving ? "Cadastrando..." : "Cadastrar usuário"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Users;