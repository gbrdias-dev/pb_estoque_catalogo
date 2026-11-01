
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";

import {
  getProducts,
  reporEstoque,
  darBaixaEstoque,
} from "../../services/api";

import "./estoque.css";

const VALID_FILTERS = ["todos", "disponiveis", "baixo", "indisponiveis"];

function Stock() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState(() => {
    const filterParam = searchParams.get("filter");
    return VALID_FILTERS.includes(filterParam) ? filterParam : "todos";
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedExitProduct, setSelectedExitProduct] = useState(null);
  const [quantidadeSaida, setQuantidadeSaida] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valorCompra, setValorCompra] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadProducts() {
    const data = await getProducts();
    const productList = Array.isArray(data)
      ? data
      : data.results || [];

    setProducts(
      productList.map((product) => ({
        ...product,
        quantidade: Number(product.quantidade),
      }))
    );
  }

  useEffect(() => {
    let active = true;

    async function loadInitialProducts() {
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
      } catch {
        if (active) {
          setError(
            "Não foi possível carregar os produtos. Tente atualizar a página."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInitialProducts();

    return () => {
      active = false;
    };
  }, []);

  // Mantém o filtro sincronizado com o parâmetro da URL.
  useEffect(() => {
    const filterParam = searchParams.get("filter");

    if (VALID_FILTERS.includes(filterParam)) {
      setFilter(filterParam);
    } else {
      setFilter("todos");
    }
  }, [searchParams]);

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

  function formatDate(value) {
    if (!value) return "Sem registro";

    const parts = value.split("-");
    if (parts.length !== 3) return value;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

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

  function openReplenishment(product) {
    setSelectedProduct(product);
    setQuantidade("");
    setValorCompra("");
    setError("");
    setSuccess("");
  }

  function closeReplenishment() {
    if (saving) return;

    setSelectedProduct(null);
    setQuantidade("");
    setValorCompra("");
  }

  function openStockExit(product) {
    setSelectedExitProduct(product);
    setQuantidadeSaida("");
    setError("");
    setSuccess("");
  }

  function closeStockExit() {
    if (saving) return;

    setSelectedExitProduct(null);
    setQuantidadeSaida("");
  }

  async function handleStockExitSubmit(event) {
    event.preventDefault();

    if (!selectedExitProduct || saving) return;

    const quantityValue = Number(quantidadeSaida);

    if (
      quantidadeSaida.trim() === "" ||
      !Number.isInteger(quantityValue) ||
      quantityValue <= 0
    ) {
      setError("Informe uma quantidade inteira maior que zero.");
      return;
    }

    if (quantityValue > Number(selectedExitProduct.quantidade)) {
      setError(
        `A quantidade informada é maior que o estoque disponível (${selectedExitProduct.quantidade}).`
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await darBaixaEstoque(selectedExitProduct.id, quantityValue);
      await loadProducts();

      setSuccess(
        `Baixa de ${quantityValue} unidade(s) de ${selectedExitProduct.descricao} registrada com sucesso.`
      );

      setSelectedExitProduct(null);
      setQuantidadeSaida("");
    } catch (err) {
      setError(
        err?.data?.detail ||
          err?.data?.quantidade ||
          "Não foi possível registrar a baixa. Verifique sua sessão e tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReplenishmentSubmit(event) {
    event.preventDefault();

    if (!selectedProduct || saving) return;

    const quantityValue = Number(quantidade);
    const purchaseValue = Number(valorCompra);

    if (
      quantidade.trim() === "" ||
      !Number.isInteger(quantityValue) ||
      quantityValue <= 0
    ) {
      setError("Informe uma quantidade inteira maior que zero.");
      return;
    }

    if (
      valorCompra.trim() === "" ||
      !Number.isFinite(purchaseValue) ||
      purchaseValue < 0 ||
      !/^\d+([.,]\d{1,2})?$/.test(valorCompra.trim())
    ) {
      setError(
        "Informe o valor total da compra com até duas casas decimais."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await reporEstoque(
        selectedProduct.id,
        quantityValue,
        valorCompra.trim().replace(",", ".")
      );

      await loadProducts();

      setSuccess(
        `Reposição de ${selectedProduct.descricao} registrada com sucesso.`
      );

      setSelectedProduct(null);
      setQuantidade("");
      setValorCompra("");
    } catch (err) {
      setError(
        err?.data?.detail ||
          err?.data?.quantidade ||
          err?.data?.valor_compra ||
          "Não foi possível registrar a reposição. Verifique sua sessão e tente novamente."
      );
    } finally {
      setSaving(false);
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
              <p className="dashboard-eyebrow">GERENCIAMENTO</p>
              <h1>Estoque</h1>
              <p>
                Acompanhe a disponibilidade e registre as reposições
                dos produtos.
              </p>
            </div>
          </div>

          {error && (
            <p role="alert" className="stock-message stock-error">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="stock-message stock-success">
              {success}
            </p>
          )}

          <section className="stock-summary">
            <article className="stock-summary-card">
              <span className="stock-summary-label">
                Total de produtos
              </span>
              <strong>{loading ? "..." : totalProducts}</strong>
              <span className="stock-summary-description">
                Produtos cadastrados
              </span>
            </article>

            <article className="stock-summary-card">
              <span className="stock-summary-label">Disponíveis</span>
              <strong>{loading ? "..." : availableProducts}</strong>
              <span className="stock-summary-description">
                Com pelo menos uma unidade
              </span>
            </article>

            <article className="stock-summary-card stock-summary-warning">
              <span className="stock-summary-label">Estoque baixo</span>
              <strong>{loading ? "..." : lowStockProducts}</strong>
              <span className="stock-summary-description">
                De 1 a 3 unidades
              </span>
            </article>

            <article className="stock-summary-card stock-summary-danger">
              <span className="stock-summary-label">Sem estoque</span>
              <strong>{loading ? "..." : unavailableProducts}</strong>
              <span className="stock-summary-description">
                Precisam de reposição
              </span>
            </article>
          </section>

          <section className="stock-content">
            <div className="stock-content-header">
              <div>
                <h2>Produtos em estoque</h2>
                <p>
                  Consulte as quantidades e a data da última compra.
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
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Digite o nome do produto..."
                />
              </div>

              <div className="stock-filter">
                <label htmlFor="stock-filter-select">Situação</label>
                <select
                  id="stock-filter-select"
                  value={filter}
                  onChange={(event) => {
                    const selectedFilter = event.target.value;
                    setFilter(selectedFilter);

                    setSearchParams((currentParams) => {
                      const nextParams = new URLSearchParams(currentParams);

                      if (selectedFilter === "todos") {
                        nextParams.delete("filter");
                      } else {
                        nextParams.set("filter", selectedFilter);
                      }

                      return nextParams;
                    });
                  }}
                >
                  <option value="todos">Todas as situações</option>
                  <option value="disponiveis">
                    Disponíveis (mais de 3)
                  </option>
                  <option value="baixo">Estoque baixo</option>
                  <option value="indisponiveis">Sem estoque</option>
                </select>
              </div>
            </div>

            <div className="stock-table-wrapper">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Situação</th>
                    <th>Última compra</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="stock-table-empty">
                        Carregando produtos...
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const quantity = Number(product.quantidade);
                      const stockStatus = getStockStatus(quantity);

                      return (
                        <tr key={product.id}>
                          <td>
                            <strong>{product.descricao}</strong>
                          </td>

                          <td>
                            <span className="stock-quantity-value">
                              {quantity}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`stock-status ${stockStatus.className}`}
                            >
                              {stockStatus.label}
                            </span>
                          </td>

                          <td>{formatDate(product.ultima_compra)}</td>

                          <td>
                            <button
                              type="button"
                              className="stock-replenish-button"
                              onClick={() => openReplenishment(product)}
                            >
                              Repor estoque
                            </button>
                            <button
                              type="button"
                              className="stock-exit-button"
                              onClick={() => openStockExit(product)}
                              disabled={quantity <= 0}
                              title={
                                quantity <= 0
                                  ? "Produto sem unidades disponíveis"
                                  : "Registrar saída de estoque"
                              }
                            >
                              Dar baixa
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="stock-table-empty">
                        Nenhum produto encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="stock-table-footer">
              Exibindo {loading ? 0 : filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "produto" : "produtos"}
            </div>
          </section>
        </main>
      </div>

      {selectedProduct && (
        <div
          className="stock-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReplenishment();
            }
          }}
        >
          <section
            className="stock-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-modal-title"
          >
            <div className="stock-modal-header">
              <div>
                <p className="dashboard-eyebrow">GERENCIAMENTO</p>
                <h2 id="stock-modal-title">Repor estoque</h2>
                <p>{selectedProduct.descricao}</p>
              </div>

              <button
                type="button"
                className="stock-modal-close"
                aria-label="Fechar formulário"
                onClick={closeReplenishment}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="stock-current-quantity">
              Estoque atual:{" "}
              <strong>{selectedProduct.quantidade} unidades</strong>
            </div>

            <form onSubmit={handleReplenishmentSubmit}>
              <div className="stock-form-grid">
                <div className="stock-field">
                  <label htmlFor="replenishment-quantity">
                    Quantidade recebida
                  </label>
                  <input
                    id="replenishment-quantity"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={quantidade}
                    onChange={(event) => setQuantidade(event.target.value)}
                    placeholder="Ex.: 10"
                    disabled={saving}
                  />
                </div>

                <div className="stock-field">
                  <label htmlFor="replenishment-value">
                    Valor total da compra (R$)
                  </label>
                  <input
                    id="replenishment-value"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={valorCompra}
                    onChange={(event) => setValorCompra(event.target.value)}
                    placeholder="Ex.: 125,00"
                    disabled={saving}
                  />
                </div>
              </div>

              <p className="stock-form-note">
                A quantidade recebida será somada ao estoque atual e a
                compra ficará registrada no histórico.
              </p>

              {error && (
                <p role="alert" className="stock-message stock-error">
                  {error}
                </p>
              )}

              <div className="stock-form-actions">
                <button
                  type="button"
                  className="stock-cancel-button"
                  onClick={closeReplenishment}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="stock-replenish-button"
                  disabled={saving}
                >
                  {saving ? "Registrando..." : "Confirmar reposição"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedExitProduct && (
        <div
          className="stock-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeStockExit();
            }
          }}
        >
          <section
            className="stock-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-exit-modal-title"
          >
            <div className="stock-modal-header">
              <div>
                <p className="dashboard-eyebrow">GERENCIAMENTO</p>
                <h2 id="stock-exit-modal-title">Dar baixa no estoque</h2>
                <p>{selectedExitProduct.descricao}</p>
              </div>

              <button
                type="button"
                className="stock-modal-close"
                aria-label="Fechar formulário"
                onClick={closeStockExit}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="stock-current-quantity">
              Estoque atual:{" "}
              <strong>{selectedExitProduct.quantidade} unidades</strong>
            </div>

            <form onSubmit={handleStockExitSubmit}>
              <div className="stock-form-grid">
                <div className="stock-field">
                  <label htmlFor="stock-exit-quantity">
                    Quantidade a retirar
                  </label>
                  <input
                    id="stock-exit-quantity"
                    type="number"
                    min="1"
                    max={selectedExitProduct.quantidade}
                    step="1"
                    required
                    value={quantidadeSaida}
                    onChange={(event) => setQuantidadeSaida(event.target.value)}
                    placeholder="Ex.: 2"
                    disabled={saving}
                  />
                </div>
              </div>

              <p className="stock-form-note">
                A quantidade informada será subtraída do estoque atual. Não
                será possível retirar mais unidades do que estão disponíveis.
              </p>

              {error && (
                <p role="alert" className="stock-message stock-error">
                  {error}
                </p>
              )}

              <div className="stock-form-actions">
                <button
                  type="button"
                  className="stock-cancel-button"
                  onClick={closeStockExit}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="stock-exit-button"
                  disabled={saving}
                >
                  {saving ? "Registrando..." : "Confirmar baixa"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Stock;