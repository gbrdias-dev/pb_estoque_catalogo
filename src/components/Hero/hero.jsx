import "./hero.css";
import produto from "../../assets/imagens/brinco.png";


function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-container">

        {/* Conteúdo principal do Hero */}
        <div className="hero-content">
          <p className="hero-eyebrow">P&B BIJUTERIAS</p>

          <h1>
            Bijuterias feitas para você{" "}
            <span>brilhar todos os dias</span>
          </h1>

          <p className="hero-description">
            Peças modernas e acessíveis para completar seu estilo
            em todos os momentos.
          </p>

          {/* Botão que futuramente levará para o catálogo */}
          <a href="/catalogo" className="hero-button">
            Conheça nosso catálogo
          </a>
        </div>

        {/* Área reservada para a imagem do Hero */}
        <div className="hero-image">
            <img
            src={produto}
            alt="Brinco Dourado"
          />
        </div>

      </div>
    </section>
  );
}

export default Hero;