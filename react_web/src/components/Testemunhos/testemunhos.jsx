import "./testemunhos.css";

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Eliane Pereira",
      role: "Cliente P&B",
      text: "É preciso ter uma alma muito generosa para espalhar beleza dessa forma, permitindo que outras mulheres carreguem consigo um pedaço da sua arte e do seu coração e, se sintam mais leves, mais vibrantes e muito mais lindas.. É assim que me sinto e quero continuar me sentindo… Admirável!",
    },
    {
      id: 2,
      name: "Ana Paula Rajo",
      role: "Cliente P&B",
      text: "As bijus da Patrícia são simplesmente lindas! Além do design impecável, a qualidade é excelente: não estragam, permanecem sempre novas e bem cuidadas. O atendimento é atencioso e transmite confiança. Fico muito satisfeita com cada compra.",
    },
    {
      id: 3,
      name: "Magaly Evangelista",
      role: "Cliente P&B",
      text: "Eu adoro as bijuterias que comprei na P&B! São além de lindas, preço bom, duráveis e de excelente qualidade! Super indico!!",
    },
  ];

  return (
    <section className="testimonials" id="testemunhos">
      <div className="testimonials-container">
        {/* Cabeçalho da seção */}
        <div className="testimonials-heading">
          <p className="testimonials-eyebrow">DEPOIMENTOS</p>

          <h2>
            O que nossas clientes
            <span> dizem sobre nós</span>
          </h2>

          <p className="testimonials-introduction">
            Confira as experiências de quem já conhece a P&B.
          </p>
        </div>

        {/* Cards dos testemunhos */}
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.id}>
              {/* Espaço reservado para uma avaliação em estrelas */}
              <div className="testimonial-stars" aria-label="Avaliação">
                ★ ★ ★ ★ ★
              </div>

              <blockquote>
                “{testimonial.text}”
              </blockquote>

              {/* Você pode substituir o nome e a função pelos dados reais */}
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {testimonial.name.charAt(0)}
                </div>

                <div>
                  <h3>{testimonial.name}</h3>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;