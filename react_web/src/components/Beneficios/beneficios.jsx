import "./beneficios.css";

function Benefits() {
  const benefits = [
    {
      number: "01",
      title: "Qualidade e estilo",
      description: "Peças selecionadas para complementar seu visual com beleza e personalidade.",
    },
    {
      number: "02",
      title: "Preços acessíveis",
      description: "Acessórios elegantes com preços que cabem no seu orçamento.",
    },
    {
      number: "03",
      title: "Variedade de peças",
      description: "Encontre opções para diferentes estilos, ocasiões e momentos.",
    },
    {
      number: "04",
      title: "Atendimento especial",
      description: "Estamos aqui para ajudar você a encontrar a peça ideal.",
    },
  ];

  return (
    <section className="benefits" id="beneficios">
      <div className="benefits-container">
        <div className="benefits-heading">
          <p className="benefits-eyebrow">POR QUE COMPRAR COM A P&B?</p>

          <h2>
            Mais do que acessórios,
            <span> uma experiência especial</span>
          </h2>

          <p className="benefits-introduction">
            Descubra os motivos para escolher a P&B e encontrar acessórios
            que combinam com você.
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.number}>
              <span className="benefit-number">{benefit.number}</span>

              <div className="benefit-icon-placeholder">✦</div>

              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Benefits;