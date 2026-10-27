import { useCallback, useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";
import ProductTable from "../../components/Admin/ProductTable/ProductTable";
import ProductForm from "../../components/Admin/ProductForm/ProductForm";

import {
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  reactivateProduct,
} from "../../services/api";

import "./produtos.css";

function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Busca todos os produtos, inclusive os inativos.
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

  // Filtra por descrição, estoque e situação do produto.
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const descricao = product.descricao ?? "";
      const quantidade = Number(product.quantidade) || 0;

      const matchesSearch = descricao
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (!matchesSearch) {
        return false;
      }

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

  // Cadastra ou atualiza um produto.
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

  // Desativa o produto sem excluir seu histórico.
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

  // Reativa o produto e atualiza a tabela.
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

  function handleCancelForm() {
    setIsFormOpen(false);
    setEditingProduct(null);
    setError("");
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
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
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
    </div>
  );
}

export default Products;
