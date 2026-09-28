import "./social.css";

function Social() {
  const posts = [
    { id: 1, label: "Foto do Instagram" },
    { id: 2, label: "Foto do Instagram" },
    { id: 3, label: "Foto do Instagram" },
    { id: 4, label: "Foto do Instagram" },
  ];

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

        <div className="social-grid">
          {posts.map((post) => (
            <a
              href="https://www.instagram.com/"
              className="social-post"
              key={post.id}
              target="_blank"
              rel="noreferrer"
              aria-label={`Publicação ${post.id} no Instagram`}
            >
              <div className="social-post-placeholder">
                <span>Instagram</span>
                <small>{post.label}</small>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Social;