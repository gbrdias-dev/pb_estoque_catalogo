
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/imagens/logo_p&b.png";
import { loginAdmin } from "../../services/api";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginAdmin(email.trim(), senha);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.message || "Não foi possível realizar o login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <img src={logo} alt="Logo P&B Bijuterias" className="login-logo" />
        </div>

        <div className="login-card">
          <div className="login-header">
            <p className="login-eyebrow">
              ÁREA ADMINISTRATIVA
            </p>

            <h1>Bem-vindo</h1>

            <p>
              Entre para gerenciar produtos e estoque.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">E-mail</label>

              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite seu e-mail"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="senha">Senha</label>

              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <Link to="/" className="login-back">
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Login;
