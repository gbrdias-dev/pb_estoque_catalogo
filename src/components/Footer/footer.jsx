import "./footer.css";

function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="footer-container">

        {/* Identidade da marca */}
        <div className="footer-brand">
          <a href="#inicio" className="footer-logo">
            P&B
          </a>

          <p>
            Acessórios para valorizar seu estilo e deixar cada momento
            ainda mais especial.
          </p>
        </div>

        {/* Links de navegação */}
        <div className="footer-column">
          <h3>Navegação</h3>

          <nav className="footer-links">
            <a href="#inicio">Início</a>
            <a href="#sobre">Sobre nós</a>
            <a href="#beneficios">Benefícios</a>
            <a href="#testemunhos">Testemunhos</a>
            <a href="#social">Social</a>
          </nav>
        </div>

        {/* Contato */}
        <div className="footer-column">
          <h3>Contato</h3>

          <div className="footer-contact">
            <a href="mailto:email@exemplo.com">
              email@exemplo.com
            </a>

          </div>
        </div>

        {/* Redes sociais */}
        <div className="footer-column">
          <h3>Siga-nos</h3>

          <div className="footer-social">
            <a
              href="https://www.instagram.com/patybielbijus?stkn=MXM4Z2I1ejEwdWYwZw=="
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Rodapé inferior */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} P&B. Todos os direitos reservados.
        </p>

        <p>
          Desenvolvido para o projeto acadêmico de Banco de Dados.
        </p>
      </div>
    </footer>
  );
}

export default Footer;