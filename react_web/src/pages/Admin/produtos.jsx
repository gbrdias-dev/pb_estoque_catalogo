import { useCallback, useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";
import ProductTable from "../../components/Admin/ProductTable/ProductTable";
import ProductForm from "../../components/Admin/ProductForm/ProductForm";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
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

  // Busca os produtos reais da API Django.
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

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

  // Filtra os produtos por descrição e disponibilidade.
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const descricao = product.descricao ?? "";

      const matchesSearch = descricao
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (filter === "disponiveis") {
        return matchesSearch && product.quantidade > 0;
      }

      if (filter === "indisponiveis") {
        return matchesSearch && product.quantidade === 0;
      }

      return matchesSearch;
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

  // O backend exige autenticação para cadastrar e editar.
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

      if (err.message?.includes("401") || err.message?.includes("403")) {
        throw new Error(
          "A API recusou a operação. É necessário configurar a autenticação administrativa antes de cadastrar ou editar produtos."
        );
      }

      throw new Error(
        err.message || "Não foi possível salvar o produto."
      );
    } finally {
      setSaving(false);
    }
  }

  // A exclusão também exige autenticação no backend.
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error("Erro ao excluir produto:", err);

      if (err.message?.includes("401") || err.message?.includes("403")) {
        setError(
          "A API recusou a exclusão. É necessário configurar a autenticação administrativa."
        );
      } else {
        setError(
          err.message || "Não foi possível excluir o produto."
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
                <label htmlFor="product-filter">Status</label>

                <select
                  id="product-filter"
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                >
                  <option value="todos">Todos</option>
                  <option value="disponiveis">Disponíveis</option>
                  <option value="indisponiveis">Indisponíveis</option>
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
