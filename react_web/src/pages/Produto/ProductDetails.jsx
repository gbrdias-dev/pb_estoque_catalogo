
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";

import { getProductById } from "../../services/api";

import "./ProductDetails.css";

const API_BASE_URL = "http://localhost:8000";

function getImageUrl(imagem) {
  if (!imagem) return null;

  if (imagem.startsWith("http://") || imagem.startsWith("https://")) {
    return imagem;
  }

  return `${API_BASE_URL}${imagem.startsWith("/") ? "" : "/"}${imagem}`;
}

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        setImageError(false);

        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
        setError("Não foi possível carregar este produto.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  const imageUrl = getImageUrl(product?.imagem);

  return (
    <>
      <Header />

      <main className="product-details">
        <div className="product-details-container">
          <Link to="/catalogo" className="product-details-back">
            ← Voltar ao catálogo
          </Link>

          {loading ? (
            <p className="product-details-message">
              Carregando produto...
            </p>
          ) : error ? (
            <div className="product-details-message">
              <h1>Produto indisponível</h1>
              <p>{error}</p>
            </div>
          ) : product ? (
            <div className="product-details-content">
              <div className="product-details-image">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={product.descricao || "Imagem do produto"}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="product-details-placeholder">
                    Imagem do produto
                  </div>
                )}
              </div>

              <div className="product-details-info">
                <p className="product-details-eyebrow">
                  P&B BIJUTERIAS
                </p>

                <h1>{product.descricao}</h1>

                {Number(product.quantidade) > 0 && (
                  <p className="product-details-price">
                    R${" "}
                    {Number(product.preco)
                      .toFixed(2)
                      .replace(".", ",")}
                  </p>
                )}

                <span
                  className={`product-details-status ${
                    Number(product.quantidade) > 0
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  {Number(product.quantidade) > 0
                    ? "Disponível"
                    : "Indisponível"}
                </span>

                <p className="product-details-description">
                  Um acessório especial para complementar seu
                  estilo e valorizar seus momentos.
                </p>

                {Number(product.quantidade) > 0 && (
                  <p className="product-details-stock">
                    Disponibilidade sujeita à confirmação.
                  </p>
                )}

                <Link
                  to="/catalogo"
                  className="product-details-button"
                >
                  Continuar explorando
                </Link>
              </div>
            </div>
          ) : (
            <div className="product-details-message">
              <h1>Produto não encontrado</h1>
              <p>Não encontramos esse produto no catálogo.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetails;
