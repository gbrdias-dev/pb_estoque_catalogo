import "./header.css";
import { Link } from "react-router-dom";
import logo from "../../assets/imagens/logo_p&b.png";
import { FaInstagram } from 'react-icons/fa';

function Header() {
  return (
    <header className="header">
      <div className="header-container">

        {/* Logo da marca */}
        <a href="/" className="header-logo" aria-label="P&B - Página inicial">
          <img
            src={logo}
            alt="Logo P&B Bijuterias"
          />
        </a>

        {/* Menu principal */}
        <nav className="header-nav" aria-label="Navegação principal">
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
          <a href="#contato">Contato</a>
        </nav>

        {/* Link para o Instagram */}
        <a
          href="https://www.instagram.com/patybielbijus?stkn=MXM4Z2I1ejEwdWYwZw=="
          className="header-instagram"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram da P&B"
        >
          <FaInstagram size={30} color="#a67813" />
        </a>

      </div>
    </header>
  );
}

export default Header;