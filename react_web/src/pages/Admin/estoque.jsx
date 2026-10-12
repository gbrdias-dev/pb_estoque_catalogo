import { useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";

import "./estoque.css";

// Dados fictícios para testar a interface.
// Depois, serão substituídos pelos dados da API Django.
const initialProducts = [
  {
    id: 1,
    descricao: "Brinco Dourado",
    preco: "49.90",
    quantidade: 10,
  },
  {
    id: 2,
    descricao: "Colar Dourado",
    preco: "69.90",
    quantidade: 5,
  },
  {
    id: 3,
    descricao: "Pulseira Dourada",
    preco: "39.90",
    quantidade: 0,
  },
  {
    id: 4,
    descricao: "Anel Dourado",
    preco: "34.90",
    quantidade: 8,
  },
  {
    id: 5,
    descricao: "Brinco Pérola",
    preco: "54.90",
    quantidade: 3,
  },
  {
    id: 6,
    descricao: "Colar com Pingente",
    preco: "79.90",
    quantidade: 0,
  },
];

function Stock() {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");

  // Define a situação do estoque de cada produto.
  function getStockStatus(quantity) {
    if (quantity === 0) {
      return {
        label: "Sem estoque",
        className: "stock-status-unavailable",
      };
    }

    if (quantity <= 3) {
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

  // Calcula os indicadores com base nos produtos.
  const totalProducts = products.length;

  const availableProducts = products.filter(
    (product) => product.quantidade > 0
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      product.quantidade > 0 && product.quantidade <= 3
  ).length;

  const unavailableProducts = products.filter(
    (product) => product.quantidade === 0
  ).length;

  // Pesquisa por descrição e aplica o filtro selecionado.
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.descricao
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesFilter = true;

      if (filter === "disponiveis") {
        matchesFilter = product.quantidade > 3;
      } else if (filter === "baixo") {
        matchesFilter =
          product.quantidade > 0 && product.quantidade <= 3;
      } else if (filter === "indisponiveis") {
        matchesFilter = product.quantidade === 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, filter]);

  // Atualiza a quantidade localmente.
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

  // Impede que uma quantidade fique vazia ao sair do campo.
  function handleQuantityBlur(id) {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === id && product.quantidade === ""
          ? { ...product, quantidade: 0 }
          : product
      )
    );
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

          {/* Indicadores do estoque */}
          <section className="stock-summary">
            <article className="stock-summary-card">
              <span className="stock-summary-label">
                Total de produtos
              </span>

              <strong>{totalProducts}</strong>

              <span className="stock-summary-description">
                Produtos cadastrados
              </span>
            </article>

            <article className="stock-summary-card">
              <span className="stock-summary-label">
                Disponíveis
              </span>

              <strong>{availableProducts}</strong>

              <span className="stock-summary-description">
                Com pelo menos uma unidade
              </span>
            </article>

            <article className="stock-summary-card stock-summary-warning">
              <span className="stock-summary-label">
                Estoque baixo
              </span>

              <strong>{lowStockProducts}</strong>

              <span className="stock-summary-description">
                De 1 a 3 unidades
              </span>
            </article>

            <article className="stock-summary-card stock-summary-danger">
              <span className="stock-summary-label">
                Sem estoque
              </span>

              <strong>{unavailableProducts}</strong>

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
                  <option value="todos">Todas as situações</option>
                  <option value="disponiveis">
                    Disponíveis (mais de 3)
                  </option>
                  <option value="baixo">Estoque baixo</option>
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
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const status = getStockStatus(
                        product.quantidade === ""
                          ? 0
                          : product.quantidade
                      );

                      return (
                        <tr key={product.id}>
                          <td>
                            <strong>{product.descricao}</strong>
                          </td>

                          <td>
                            R${" "}
                            {Number(product.preco)
                              .toFixed(2)
                              .replace(".", ",")}
                          </td>

                          <td>
                            <input
                              className="stock-quantity-input"
                              type="number"
                              min="0"
                              step="1"
                              aria-label={`Quantidade de ${product.descricao}`}
                              value={product.quantidade}
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
                              {status.label}
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
              Exibindo {filteredProducts.length}{" "}
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