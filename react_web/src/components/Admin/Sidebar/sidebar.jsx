import { NavLink } from "react-router-dom";

import "./sidebar.css";

function Sidebar() {
  return (
    <aside className="admin-sidebar">

      <div className="admin-sidebar-brand">
        <span>P&B</span>
        <small>ADMIN</small>
      </div>

      <nav className="admin-sidebar-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/produtos"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Produtos
        </NavLink>

        <NavLink
          to="/admin/estoque"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Estoque
        </NavLink>

        <NavLink
          to="/admin/fornecedores"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Fornecedores
        </NavLink>
      </nav>

      <div className="admin-sidebar-footer">
        <NavLink to="/">
          Voltar para o site
        </NavLink>
      </div>

    </aside>
  );
}

export default Sidebar;