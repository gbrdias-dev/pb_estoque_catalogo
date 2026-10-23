
import { useNavigate } from "react-router-dom";
import { logoutAdmin } from "../../../services/api";

import "./adminheader.css";

function AdminHeader() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      // Encerra a sessão no Django
      await logoutAdmin();

      // Redireciona somente após confirmar a resposta
      navigate("/acesso-pb", { replace: true });
    } catch (error) {
      console.error("Erro ao encerrar a sessão:", error);
      alert(
        "Não foi possível encerrar a sessão. Verifique sua conexão e tente novamente."
      );
    }
  }

  return (
    <header className="admin-header">
      <div>
        <p className="admin-header-title">
          Painel administrativo
        </p>

        <p className="admin-header-subtitle">
          Gerencie os produtos e o estoque da P&B.
        </p>
      </div>

      <button
        type="button"
        className="admin-logout"
        onClick={handleLogout}
      >
        Sair
      </button>
    </header>
  );
}

export default AdminHeader;
