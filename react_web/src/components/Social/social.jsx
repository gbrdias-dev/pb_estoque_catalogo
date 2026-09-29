import "./social.css";

function Social() {

  return (
    <section className="social" id="social">
      <div className="social-container">
        <div className="social-heading">
          <p className="social-eyebrow">SIGA A P&B</p>

          <h2>
            Acompanhe a P&B
            <span> no Instagram</span>
          </h2>

          <p className="social-description">
            Confira nossas novidades, peças e inspirações através das
            nossas redes sociais.
          </p>

          <a
            href="https://www.instagram.com/patybielbijus?stkn=MXM4Z2I1ejEwdWYwZw=="
            className="social-button"
            target="_blank"
            rel="noreferrer"
          >
            @patybielbijus
          </a>
        </div>


      </div>
    </section>
  );
}

export default Social;