
import { Link } from "react-router-dom";
import "./product_card.css";

const API_BASE_URL = "http://localhost:8000";

function getImageUrl(imagem) {
  if (!imagem) return null;

  // Se a API já retornar uma URL completa, utiliza-a diretamente.
  if (imagem.startsWith("http://") || imagem.startsWith("https://")) {
    return imagem;
  }

  // Se retornar um caminho relativo, aponta para o servidor Django.
  return `${API_BASE_URL}${imagem.startsWith("/") ? "" : "/"}${imagem}`;
}

function ProductCard({ product }) {
  const disponivel = Number(product.quantidade) > 0;
  const imageUrl = getImageUrl(product.imagem);

  return (
    <article className="product-card">
      <div className="product-card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.descricao || "Imagem do produto"}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="product-image-placeholder">
            Imagem do produto
          </div>
        )}
      </div>

      <div className="product-card-content">
        <h3>{product.descricao}</h3>

        {disponivel && (
          <p className="product-card-price">
            R${" "}
            {Number(product.preco)
              .toFixed(2)
              .replace(".", ",")}
          </p>
        )}

        {disponivel ? (
          <span className="product-card-status available">
            Disponível
          </span>
        ) : (
          <span className="product-card-status unavailable">
            Sob Encomenda
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
