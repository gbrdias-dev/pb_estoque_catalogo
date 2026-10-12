import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    // Autenticação temporária.
    // Posteriormente será substituída pela API do Django.
    if (
      email === "admin@pbbijuterias.com" &&
      senha === "123456"
    ) {
      navigate("/admin");
      return;
    }

    setError("E-mail ou senha incorretos.");
  }

  return (
    <main className="login-page">
      <div className="login-container">

        <div className="login-brand">
          <span>P&B</span>
          <p>BIJUTERIAS</p>
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
              <label htmlFor="email">
                E-mail
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Digite seu e-mail"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="senha">
                Senha
              </label>

              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(event) =>
                  setSenha(event.target.value)
                }
                placeholder="Digite sua senha"
                required
              />
            </div>

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
            >
              Entrar
            </button>

          </form>

          <Link
            to="/"
            className="login-back"
          >
            ← Voltar para o site
          </Link>

        </div>

      </div>
    </main>
  );
}

export default Login;