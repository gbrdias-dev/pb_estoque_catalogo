
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";

import { getProductById } from "../../services/api";

import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

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
          ) : (
            <div className="product-details-content">
              <div className="product-details-image">
                {product.imagem ? (
                  <img
                    src={product.imagem}
                    alt={product.descricao}
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

                <p className="product-details-price">
                  R${" "}
                  {Number(product.preco)
                    .toFixed(2)
                    .replace(".", ",")}
                </p>

                <span
                  className={`product-details-status ${
                    product.quantidade > 0
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  {product.quantidade > 0
                    ? "Disponível"
                    : "Indisponível"}
                </span>

                <p className="product-details-description">
                  Um acessório especial para complementar seu
                  estilo e valorizar seus momentos.
                </p>

                {product.quantidade > 0 && (
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
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetails;
