
import { useEffect, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";
import { getProducts } from "../../services/api";

import "./dashboard.css";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data = await getProducts();

        // Compatível com listas simples e respostas paginadas do DRF.
        const productList = Array.isArray(data)
          ? data
          : data.results || [];

        if (active) {
          setProducts(productList);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            "Não foi possível carregar os dados dos produtos."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const statistics = [
    {
      title: "Produtos cadastrados",
      value: products.length,
    },
    {
      title: "Produtos disponíveis",
      value: products.filter(
        (product) => Number(product.quantidade) > 0
      ).length,
    },
    {
      title: "Baixo estoque",
      value: products.filter(
        (product) =>
          Number(product.quantidade) > 0 &&
          Number(product.quantidade) <= 5
      ).length,
    },
    {
      title: "Indisponíveis",
      value: products.filter(
        (product) => Number(product.quantidade) === 0
      ).length,
    },
  ];

  const recentProducts = [...products]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <AdminHeader />

        <main className="dashboard">
          <div className="dashboard-intro">
            <p className="dashboard-eyebrow">
              VISÃO GERAL
            </p>

            <h1>Dashboard</h1>

            <p>
              Acompanhe as principais informações
              do seu estoque.
            </p>
          </div>

          {error && (
            <p role="alert" className="dashboard-error">
              {error}
            </p>
          )}

          <section className="dashboard-statistics">
            {statistics.map((statistic) => (
              <article
                className="dashboard-card"
                key={statistic.title}
              >
                <p>{statistic.title}</p>

                <strong>
                  {loading ? "..." : statistic.value}
                </strong>
              </article>
            ))}
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-eyebrow">
                  PRODUTOS
                </p>

                <h2>Produtos recentes</h2>
              </div>
            </div>

            {loading ? (
              <div className="dashboard-empty">
                <p>Carregando produtos...</p>
              </div>
            ) : error ? (
              <div className="dashboard-empty">
                <p>Não foi possível carregar os produtos.</p>
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="dashboard-empty">
                <p>
                  Nenhum produto cadastrado ainda.
                </p>
              </div>
            ) : (
              <div className="dashboard-recent-products">
                {recentProducts.map((product) => (
                  <article
                    className="dashboard-recent-product"
                    key={product.id}
                  >
                    <div>
                      <strong>{product.descricao}</strong>
                      <p>
                        Código: {product.id}
                      </p>
                    </div>

                    <div className="dashboard-product-info">
                      <span>
                        {Number(product.quantidade)} em estoque
                      </span>

                      <strong>
                        {Number(product.preco).toLocaleString(
                          "pt-BR",
                          {
                            style: "currency",
                            currency: "BRL",
                          }
                        )}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
