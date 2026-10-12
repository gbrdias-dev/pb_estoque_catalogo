import { useNavigate } from "react-router-dom";

import "./adminheader.css";

function AdminHeader() {
  const navigate = useNavigate();

  function handleLogout() {
    navigate("/login");
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