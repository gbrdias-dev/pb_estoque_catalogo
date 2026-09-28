import "./Sobre.css";
import logo from "../../assets/imagens/logo_p&b.png";

function About() {
  return (
    <section className="about" id="sobre">
      <div className="about-container">

        <div className="about-image">
          <img
            src={logo}
            alt="Logo P&B Bijuterias"
          />
        </div>

        <div className="about-content">
          <p className="about-eyebrow">SOBRE NÓS</p>

          <h2>
            Detalhes que valorizam <span>o seu estilo</span>
          </h2>

          <p>
            Na P&B, acreditamos que os acessórios são capazes de
            transformar momentos simples em ocasiões especiais.
          </p>

          <p>
            Trabalhamos com peças selecionadas para oferecer beleza,
            personalidade e praticidade, ajudando você a encontrar
            acessórios que combinam com o seu estilo.
          </p>

          <a href="#contato" className="about-button">
            Saiba mais
          </a>
        </div>

      </div>
    </section>
  );
}

export default About;