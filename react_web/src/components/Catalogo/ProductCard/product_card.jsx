
import { Link } from "react-router-dom";
import "./product_card.css";

function ProductCard({ product }) {
  const disponivel = product.quantidade > 0;

  return (
    <article className="product-card">
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

      <div className="product-card-content">
        <h3>{product.descricao}</h3>

        <p className="product-card-price">
          R${" "}
          {Number(product.preco)
            .toFixed(2)
            .replace(".", ",")}
        </p>

        {disponivel ? (
          <span className="product-card-status available">
            Disponível
          </span>
        ) : (
          <span className="product-card-status unavailable">
            Indisponível
          </span>
        )}

        <Link
          to={`/produto/${product.id}`}
          className="product-card-button"
        >
          Ver produto
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
