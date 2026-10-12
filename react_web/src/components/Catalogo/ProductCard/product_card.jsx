import "./product_card.css";

function ProductCard({ product }) {
  return (
    <article className="product-card">

      {/* ================================
          IMAGEM DO PRODUTO
          ================================ */}

      <div className="product-card-image">

        {product.imagem ? (
          <img
            src={product.imagem}
            alt={product.descricao}
          />
        ) : (
          <div className="product-image-placeholder">
            Imagem do produto
          </div>
        )}

      </div>


      {/* ================================
          INFORMAÇÕES DO PRODUTO
          ================================ */}

      <div className="product-card-content">

        <h3>
          {product.descricao}
        </h3>

        <p className="product-card-price">
          R$ {Number(product.preco)
            .toFixed(2)
            .replace(".", ",")}
        </p>


        {/* ================================
            STATUS
            ================================ */}

        {product.quantidade > 0 ? (
          <span className="product-card-status available">
            Disponível
          </span>
        ) : (
          <span className="product-card-status unavailable">
            Indisponível
          </span>
        )}


        {/* ================================
            BOTÃO
            ================================ */}

        <a
          href={`/produto/${product.id}`}
          className="product-card-button"
        >
          Ver produto
        </a>

      </div>

    </article>
  );
}

export default ProductCard;