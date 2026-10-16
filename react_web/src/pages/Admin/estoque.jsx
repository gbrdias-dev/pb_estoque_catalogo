
import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";

import {
  getProducts,
  updateProductStock,
} from "../../services/api";

import "./estoque.css";

function Stock() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingIds, setSavingIds] = useState([]);

  // Carrega os produtos reais da API Django.
  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data = await getProducts();

        const productList = Array.isArray(data)
          ? data
          : data.results || [];

        if (active) {
          setProducts(
            productList.map((product) => ({
              ...product,
              quantidade: Number(product.quantidade),
            }))
          );
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            "Não foi possível carregar os produtos. Tente atualizar a página."
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

  // Define a situação do estoque de cada produto.
  function getStockStatus(quantity) {
    const amount = Number(quantity);

    if (amount === 0) {
      return {
        label: "Sem estoque",
        className: "stock-status-unavailable",
      };
    }

    if (amount <= 3) {
      return {
        label: "Estoque baixo",
        className: "stock-status-low",
      };
    }

    return {
      label: "Disponível",
      className: "stock-status-available",
    };
  }

  // Indicadores calculados com base nos dados reais.
  const totalProducts = products.length;

  const availableProducts = products.filter(
    (product) => Number(product.quantidade) > 0
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.quantidade) > 0 &&
      Number(product.quantidade) <= 3
  ).length;

  const unavailableProducts = products.filter(
    (product) => Number(product.quantidade) === 0
  ).length;

  // Pesquisa e filtros.
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const description = String(product.descricao || "");

      const matchesSearch = description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const quantity = Number(product.quantidade);
      let matchesFilter = true;

      if (filter === "disponiveis") {
        matchesFilter = quantity > 3;
      } else if (filter === "baixo") {
        matchesFilter = quantity > 0 && quantity <= 3;
      } else if (filter === "indisponiveis") {
        matchesFilter = quantity === 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, filter]);

  // Atualiza temporariamente a quantidade no formulário.
  function handleQuantityChange(id, value) {
    if (value === "") {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === id
            ? { ...product, quantidade: "" }
            : product
        )
      );

      return;
    }

    const quantity = Number(value);

    if (!Number.isInteger(quantity) || quantity < 0) {
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === id
          ? { ...product, quantidade: quantity }
          : product
      )
    );
  }

  // Salva a quantidade no PostgreSQL por meio da API.
  async function handleQuantityBlur(id) {
    const product = products.find(
      (item) => item.id === id
    );

    if (!product || savingIds.includes(id)) {
      return;
    }

    const quantity =
      product.quantidade === ""
        ? 0
        : Number(product.quantidade);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Informe uma quantidade inteira igual ou maior que zero.");
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((item) =>
        item.id === id
          ? { ...item, quantidade: quantity }
          : item
      )
    );

    setSavingIds((currentIds) => [...currentIds, id]);
    setError("");

    try {
      const updated = await updateProductStock(id, quantity);

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updated,
                quantidade: Number(
                  updated?.quantidade ?? quantity
                ),
              }
            : item
        )
      );
    } catch (err) {
      setError(
        `Não foi possível salvar a quantidade de "${product.descricao}". Os dados serão recarregados.`
      );

      // Recupera os valores que realmente estão salvos na API.
      try {
        const data = await getProducts();

        const productList = Array.isArray(data)
          ? data
          : data.results || [];

        setProducts(
          productList.map((item) => ({
            ...item,
            quantidade: Number(item.quantidade),
          }))
        );
      } catch (reloadError) {
        // Mantém a mensagem de erro original caso a recarga falhe.
      }
    } finally {
      setSavingIds((currentIds) =>
        currentIds.filter((savingId) => savingId !== id)
      );
    }
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <AdminHeader />

        <main className="stock-page">
          <div className="stock-page-header">
            <div>
              <p className="dashboard-eyebrow">
                GERENCIAMENTO
              </p>

              <h1>Estoque</h1>

              <p>
                Acompanhe as quantidades e a disponibilidade
                dos produtos.
              </p>
            </div>
          </div>

          {error && (
            <p role="alert" className="stock-error">
              {error}
            </p>
          )}

          {/* Indicadores do estoque */}
          <section className="stock-summary">
            <article className="stock-summary-card">
              <span className="stock-summary-label">
                Total de produtos
              </span>

              <strong>
                {loading ? "..." : totalProducts}
              </strong>

              <span className="stock-summary-description">
                Produtos cadastrados
              </span>
            </article>

            <article className="stock-summary-card">
              <span className="stock-summary-label">
                Disponíveis
              </span>

              <strong>
                {loading ? "..." : availableProducts}
              </strong>

              <span className="stock-summary-description">
                Com pelo menos uma unidade
              </span>
            </article>

            <article className="stock-summary-card stock-summary-warning">
              <span className="stock-summary-label">
                Estoque baixo
              </span>

              <strong>
                {loading ? "..." : lowStockProducts}
              </strong>

              <span className="stock-summary-description">
                De 1 a 3 unidades
              </span>
            </article>

            <article className="stock-summary-card stock-summary-danger">
              <span className="stock-summary-label">
                Sem estoque
              </span>

              <strong>
                {loading ? "..." : unavailableProducts}
              </strong>

              <span className="stock-summary-description">
                Precisam de reposição
              </span>
            </article>
          </section>

          {/* Busca e filtros */}
          <section className="stock-content">
            <div className="stock-content-header">
              <div>
                <h2>Produtos em estoque</h2>

                <p>
                  Consulte e ajuste a quantidade dos produtos.
                </p>
              </div>
            </div>

            <div className="stock-controls">
              <div className="stock-search">
                <label htmlFor="stock-search-input">
                  Buscar produto
                </label>

                <input
                  id="stock-search-input"
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Digite o nome do produto..."
                />
              </div>

              <div className="stock-filter">
                <label htmlFor="stock-filter-select">
                  Situação
                </label>

                <select
                  id="stock-filter-select"
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                >
                  <option value="todos">
                    Todas as situações
                  </option>

                  <option value="disponiveis">
                    Disponíveis (mais de 3)
                  </option>

                  <option value="baixo">
                    Estoque baixo
                  </option>

                  <option value="indisponiveis">
                    Sem estoque
                  </option>
                </select>
              </div>
            </div>

            <div className="stock-table-wrapper">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Preço</th>
                    <th>Quantidade</th>
                    <th>Situação</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="stock-table-empty"
                      >
                        Carregando produtos...
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const quantity =
                        product.quantidade === ""
                          ? 0
                          : Number(product.quantidade);

                      const status = getStockStatus(quantity);

                      return (
                        <tr key={product.id}>
                          <td>
                            <strong>{product.descricao}</strong>
                          </td>

                          <td>
                            {Number(product.preco).toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                              }
                            )}
                          </td>

                          <td>
                            <input
                              className="stock-quantity-input"
                              type="number"
                              min="0"
                              step="1"
                              aria-label={`Quantidade de ${product.descricao}`}
                              value={product.quantidade}
                              disabled={savingIds.includes(product.id)}
                              onChange={(event) =>
                                handleQuantityChange(
                                  product.id,
                                  event.target.value
                                )
                              }
                              onBlur={() =>
                                handleQuantityBlur(product.id)
                              }
                            />
                          </td>

                          <td>
                            <span
                              className={`stock-status ${status.className}`}
                            >
                              {savingIds.includes(product.id)
                                ? "Salvando..."
                                : status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="stock-table-empty"
                      >
                        Nenhum produto encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="stock-table-footer">
              Exibindo {loading ? 0 : filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "produto"
                : "produtos"}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Stock;
