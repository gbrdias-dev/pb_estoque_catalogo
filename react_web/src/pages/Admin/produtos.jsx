
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";
import ProductTable from "../../components/Admin/ProductTable/ProductTable";
import ProductForm from "../../components/Admin/ProductForm/ProductForm";

import {
  getAllProductsAdmin,
  getProductHistory,
  createProduct,
  updateProduct,
  deleteProduct,
  reactivateProduct,
} from "../../services/api";

import "./produtos.css";

function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const [filter, setFilter] = useState(() => {
    const filterParam = searchParams.get("filter");
    const validFilters = [
      "todos",
      "ativos",
      "inativos",
      "disponiveis",
      "indisponiveis",
    ];

    return validFilters.includes(filterParam) ? filterParam : "todos";
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [historyProduct, setHistoryProduct] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllProductsAdmin();

      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setProducts(productList);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);

      setError(
        "Não foi possível carregar os produtos. Verifique se a API Django está funcionando."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Mantém o filtro sincronizado com os parâmetros da URL.
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    const validFilters = [
      "todos",
      "ativos",
      "inativos",
      "disponiveis",
      "indisponiveis",
    ];

    setFilter(
      validFilters.includes(filterParam) ? filterParam : "todos"
    );
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const descricao = product.descricao ?? "";
      const quantidade = Number(product.quantidade) || 0;

      const matchesSearch = descricao
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === "disponiveis") {
        return product.ativo === true && quantidade > 0;
      }

      if (filter === "indisponiveis") {
        return product.ativo === true && quantidade === 0;
      }

      if (filter === "ativos") {
        return product.ativo === true;
      }

      if (filter === "inativos") {
        return product.ativo === false;
      }

      return true;
    });
  }, [products, searchTerm, filter]);

  function handleAdd() {
    setEditingProduct(null);
    setError("");
    setIsFormOpen(true);
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setError("");
    setIsFormOpen(true);
  }

  async function handleSave(productData) {
    if (saving) return;

    try {
      setSaving(true);
      setError("");

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      await loadProducts();

      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Erro ao salvar produto:", err);

      if (err.status === 401 || err.status === 403) {
        throw new Error(
          "A API recusou a operação. Verifique sua autenticação administrativa."
        );
      }

      throw new Error(
        err.message || "Não foi possível salvar o produto."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Deseja desativar este produto? Ele deixará de aparecer no catálogo público, mas seu histórico será preservado."
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error("Erro ao desativar produto:", err);

      if (err.status === 401 || err.status === 403) {
        setError(
          "A API recusou a operação. Verifique sua autenticação administrativa."
        );
      } else {
        setError(
          err.message || "Não foi possível desativar o produto."
        );
      }
    }
  }

  async function handleReactivate(id) {
    const confirmed = window.confirm(
      "Deseja reativar este produto? Ele voltará a aparecer no catálogo público."
    );

    if (!confirmed) return;

    try {
      setError("");

      await reactivateProduct(id);
      await loadProducts();
    } catch (err) {
      console.error("Erro ao reativar produto:", err);

      if (err.status === 401 || err.status === 403) {
        setError(
          "A API recusou a operação. Verifique sua autenticação administrativa."
        );
      } else {
        setError(
          err.message || "Não foi possível reativar o produto."
        );
      }
    }
  }

  async function handleViewHistory(product) {
    setHistoryProduct(product);
    setHistoryItems([]);
    setHistoryError("");
    setHistoryLoading(true);

    try {
      const data = await getProductHistory(product.id);

      setHistoryItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);

      setHistoryError(
        err.status === 401 || err.status === 403
          ? "Acesso negado. Verifique sua sessão administrativa."
          : "Não foi possível carregar o histórico deste produto."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleCloseHistory() {
    setHistoryProduct(null);
    setHistoryItems([]);
    setHistoryError("");
  }

  function handleCancelForm() {
    setIsFormOpen(false);
    setEditingProduct(null);
    setError("");
  }

  function formatDate(value) {
    if (!value) return "—";

    const dateValue = String(value).slice(0, 10);
    const parts = dateValue.split("-");

    if (parts.length !== 3) return dateValue;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <AdminHeader />

        <main className="products-page">
          <div className="products-page-header">
            <div>
              <p className="dashboard-eyebrow">GERENCIAMENTO</p>
              <h1>Produtos</h1>
              <p>
                Cadastre, edite e gerencie os produtos do catálogo.
              </p>
            </div>

            <button
              type="button"
              className="add-product-button"
              onClick={handleAdd}
            >
              + Adicionar produto
            </button>
          </div>

          <section className="products-content">
            <div className="products-controls">
              <div className="products-search">
                <label htmlFor="product-search">
                  Buscar produto
                </label>

                <input
                  id="product-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Digite o nome do produto..."
                />
              </div>

              <div className="products-filter">
                <label htmlFor="product-filter">
                  Filtrar produtos
                </label>

                <select
                  id="product-filter"
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
                  <option value="todos">Todos os produtos</option>
                  <option value="ativos">Ativos</option>
                  <option value="inativos">Inativos</option>
                  <option value="disponiveis">
                    Ativos com estoque
                  </option>
                  <option value="indisponiveis">
                    Ativos sem estoque
                  </option>
                </select>
              </div>
            </div>

            {error && !isFormOpen && (
              <div className="product-form-error" role="alert">
                {error}

                <button type="button" onClick={loadProducts}>
                  Tentar novamente
                </button>
              </div>
            )}

            {loading ? (
              <p>Carregando produtos...</p>
            ) : (
              <>
                <div className="products-count">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1
                    ? "produto"
                    : "produtos"}
                </div>

                <ProductTable
                  products={filteredProducts}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReactivate={handleReactivate}
                  onViewHistory={handleViewHistory}
                />
              </>
            )}
          </section>
        </main>
      </div>

      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={handleCancelForm}
        />
      )}

      {historyProduct && (
        <div
          className="product-history-overlay"
          onClick={handleCloseHistory}
        >
          <section
            className="product-history-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-history-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="product-history-header">
              <div>
                <p className="dashboard-eyebrow">
                  MOVIMENTAÇÕES REGISTRADAS
                </p>

                <h2 id="product-history-title">
                  Histórico do produto
                </h2>

                <p>{historyProduct.descricao}</p>
              </div>

              <button
                type="button"
                className="product-history-close"
                onClick={handleCloseHistory}
                aria-label="Fechar histórico"
              >
                ×
              </button>
            </header>

            <div className="product-history-summary">
              <span>Estoque atual</span>
              <strong>
                {Number(historyProduct.quantidade) || 0} unidades
              </strong>
            </div>

            {historyLoading ? (
              <p className="product-history-message">
                Carregando histórico...
              </p>
            ) : historyError ? (
              <div className="product-history-error" role="alert">
                {historyError}
              </div>
            ) : historyItems.length === 0 ? (
              <p className="product-history-message">
                Nenhuma reposição registrada para este produto.
              </p>
            ) : (
              <div className="product-history-table-wrapper">
                <table className="product-history-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Movimentação</th>
                      <th>Quantidade</th>
                      <th>Valor da compra</th>
                      <th>Responsável</th>
                    </tr>
                  </thead>

                  <tbody>
                    {historyItems.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDate(item.data_compra)}</td>
                        <td>{item.tipo || "Reposição"}</td>
                        <td>+{item.quantidade}</td>
                        <td>{formatCurrency(item.valor_compra)}</td>
                        <td>{item.usuario || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <footer className="product-history-footer">
              <button
                type="button"
                className="edit-button"
                onClick={handleCloseHistory}
              >
                Fechar
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

export default Products;