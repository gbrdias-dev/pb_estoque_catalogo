import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";
import {
  getUsers,
  createUser,
  updateUser,
  resetUserPassword,
} from "../../services/api";
import "./usuarios.css";

const emptyForm = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
};

const emptyPasswordForm = {
  senha: "",
  confirmarSenha: "",
};

function getApiErrorMessage(err, fallback) {
  const apiError = err?.data;

  if (apiError && typeof apiError === "object") {
    for (const field of ["email", "senha", "nome"]) {
      if (apiError[field]) {
        const detail = Array.isArray(apiError[field])
          ? apiError[field].join(" ")
          : apiError[field];
        return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${detail}`;
      }
    }

    if (apiError.detail) return apiError.detail;
  }

  return err?.message || fallback;
}

function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [passwordData, setPasswordData] = useState({ ...emptyPasswordForm });
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

  function openCreateForm() {
    setFormMode("create");
    setSelectedUser(null);
    setFormData({ ...emptyForm });
    setPasswordData({ ...emptyPasswordForm });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditForm(user) {
    setFormMode("edit");
    setSelectedUser(user);
    setFormData({
      nome: user.nome || "",
      email: user.email || "",
      senha: "",
      confirmarSenha: "",
    });
    setPasswordData({ ...emptyPasswordForm });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openPasswordForm(user) {
    setFormMode("password");
    setSelectedUser(user);
    setFormData({ ...emptyForm });
    setPasswordData({ ...emptyPasswordForm });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswordData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const nome = formData.nome.trim();
    const email = formData.email.trim().toLowerCase();

    if (!nome) {
      setError("Informe o nome do usuário.");
      return;
    }

    if (!email) {
      setError("Informe o e-mail do usuário.");
      return;
    }

    if (formMode === "create") {
      if (!formData.senha || !formData.confirmarSenha) {
        setError("Preencha os campos de senha.");
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
    }

    setSaving(true);

    try {
      if (formMode === "create") {
        await createUser({ nome, email, senha: formData.senha });
        setSuccess("Usuário administrativo cadastrado com sucesso.");
      } else {
        await updateUser(selectedUser.id, { nome, email });
        setSuccess("Dados do usuário atualizados com sucesso.");
      }

      setIsFormOpen(false);
      setFormData({ ...emptyForm });
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          formMode === "create"
            ? "Não foi possível cadastrar o usuário."
            : "Não foi possível atualizar o usuário."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!passwordData.senha || !passwordData.confirmarSenha) {
      setError("Preencha os dois campos de senha.");
      return;
    }

    if (passwordData.senha.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (passwordData.senha !== passwordData.confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setSaving(true);

    try {
      await resetUserPassword(
        selectedUser.id,
        passwordData.senha,
        passwordData.confirmarSenha
      );

      setIsFormOpen(false);
      setPasswordData({ ...emptyPasswordForm });
      setSuccess(`Senha de ${selectedUser.nome} redefinida com sucesso.`);
      setSelectedUser(null);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Não foi possível redefinir a senha.")
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (saving) return;

    setIsFormOpen(false);
    setFormData({ ...emptyForm });
    setPasswordData({ ...emptyPasswordForm });
    setSelectedUser(null);
    setError("");
  }

  const modalTitle =
    formMode === "create"
      ? "Novo usuário administrativo"
      : formMode === "edit"
        ? "Editar usuário administrativo"
        : "Redefinir senha";

  const modalDescription =
    formMode === "create"
      ? "Preencha os dados para criar uma conta com acesso ao painel."
      : formMode === "edit"
        ? "Atualize os dados de acesso deste usuário."
        : `Defina uma nova senha para ${selectedUser?.nome || "este usuário"}.`;

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
              onClick={openCreateForm}
              disabled={saving}
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
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="users-empty">Carregando usuários...</td>
                    </tr>
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
                        <td>
                          <div className="users-row-actions">
                            <button
                              type="button"
                              className="users-action-button users-edit-button"
                              onClick={() => openEditForm(user)}
                              disabled={saving}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="users-action-button users-password-button"
                              onClick={() => openPasswordForm(user)}
                              disabled={saving}
                            >
                              Redefinir senha
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="users-empty">
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
                <h2 id="users-form-title">{modalTitle}</h2>
                <p>{modalDescription}</p>
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

            {formMode === "password" ? (
              <form onSubmit={handlePasswordSubmit} noValidate>
                <div className="users-form-grid">
                  <div className="users-field full-width">
                    <label htmlFor="users-password">Nova senha *</label>
                    <input
                      id="users-password"
                      name="senha"
                      type="password"
                      autoComplete="new-password"
                      value={passwordData.senha}
                      onChange={handlePasswordChange}
                      placeholder="Mínimo de 8 caracteres"
                      required
                    />
                  </div>
                  <div className="users-field full-width">
                    <label htmlFor="users-confirm-password">Confirmar nova senha *</label>
                    <input
                      id="users-confirm-password"
                      name="confirmarSenha"
                      type="password"
                      autoComplete="new-password"
                      value={passwordData.confirmarSenha}
                      onChange={handlePasswordChange}
                      placeholder="Repita a nova senha"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="users-message users-error" role="alert">{error}</p>
                )}

                <div className="users-form-note">
                  A nova senha será armazenada com hash e não poderá ser consultada posteriormente.
                </div>

                <div className="users-form-actions">
                  <button type="button" className="users-cancel-button" onClick={handleCancel} disabled={saving}>
                    Cancelar
                  </button>
                  <button type="submit" className="users-save-button" disabled={saving}>
                    {saving ? "Salvando..." : "Redefinir senha"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
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
                      autoComplete="off"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="usuario@exemplo.com"
                      required
                    />
                  </div>

                  {formMode === "create" && (
                    <>
                      <div className="users-field">
                        <label htmlFor="users-password">Senha *</label>
                        <input
                          id="users-password"
                          name="senha"
                          type="password"
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
                          autoComplete="new-password"
                          value={formData.confirmarSenha}
                          onChange={handleChange}
                          placeholder="Repita a senha"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <p className="users-message users-error" role="alert">{error}</p>
                )}

                {formMode === "create" && (
                  <div className="users-form-note">
                    A senha será armazenada com hash e não poderá ser consultada pela lista.
                  </div>
                )}

                <div className="users-form-actions">
                  <button type="button" className="users-cancel-button" onClick={handleCancel} disabled={saving}>
                    Cancelar
                  </button>
                  <button type="submit" className="users-save-button" disabled={saving}>
                    {saving
                      ? formMode === "create" ? "Cadastrando..." : "Salvando..."
                      : formMode === "create" ? "Cadastrar usuário" : "Salvar alterações"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Users;