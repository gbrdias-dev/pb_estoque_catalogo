import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";
import { getAllProductsAdmin } from "../../services/api";

import "./dashboard.css";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data = await getAllProductsAdmin();

        // Compatível com listas simples e respostas paginadas do DRF.
        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        if (active) {
          setProducts(productList);
          setError("");
        }
      } catch (err) {
        console.error("Erro ao carregar produtos do dashboard:", err);

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

  // Produtos cadastrados: inclui ativos e inativos.
  const activeProducts = products.filter(
    (product) => product.ativo !== false
  );

  const statistics = [
    {
      title: "Produtos cadastrados",
      value: products.length,
      to: "/admin/produtos?filter=todos",
      description: "Ver todos os produtos",
    },
    {
      title: "Produtos disponíveis",
      value: activeProducts.filter(
        (product) => Number(product.quantidade) > 0
      ).length,
      to: "/admin/produtos?filter=disponiveis",
      description: "Ver produtos disponíveis",
    },
    {
      title: "Baixo estoque",
      value: activeProducts.filter(
        (product) =>
          Number(product.quantidade) > 0 &&
          Number(product.quantidade) <= 5
      ).length,
      to: "/admin/estoque?filter=baixo",
      description: "Ver produtos com baixo estoque",
    },
    {
      title: "Indisponíveis",
      value: activeProducts.filter(
        (product) => Number(product.quantidade) <= 0
      ).length,
      to: "/admin/produtos?filter=indisponiveis",
      description: "Ver produtos sem estoque",
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
            <p className="dashboard-eyebrow">VISÃO GERAL</p>
            <h1>Dashboard</h1>
            <p>
              Acompanhe as principais informações do seu estoque.
            </p>
          </div>

          {error && (
            <p role="alert" className="dashboard-error">
              {error}
            </p>
          )}

          <section
            className="dashboard-statistics"
            aria-label="Indicadores do estoque"
          >
            {statistics.map((statistic) => (
              <Link
                className="dashboard-card-link"
                to={statistic.to}
                key={statistic.title}
                aria-label={`${statistic.title}: ${
                  loading ? "carregando" : statistic.value
                }. ${statistic.description}`}
              >
                <article className="dashboard-card">
                  <p>{statistic.title}</p>

                  <strong>
                    {loading ? "..." : statistic.value}
                  </strong>

                  <span className="dashboard-card-hint">
                    {statistic.description}
                  </span>
                </article>
              </Link>
            ))}
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-eyebrow">PRODUTOS</p>
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
                <p>Nenhum produto cadastrado ainda.</p>
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
                      <p>Código: {product.id}</p>
                    </div>

                    <div className="dashboard-product-info">
                      <span>
                        {Number(product.quantidade) || 0} em estoque
                      </span>

                      <strong>
                        {Number(product.preco).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
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
