import { useMemo, useState } from "react";

import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";
import ProductTable from "../../components/Admin/ProductTable/ProductTable";
import ProductForm from "../../components/Admin/ProductForm/ProductForm";
import "./produtos.css";

function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");

  // Controla a abertura e o fechamento do formulário.
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Armazena o produto que está sendo editado.
  // null significa que estamos cadastrando um novo produto.
  const [editingProduct, setEditingProduct] = useState(null);

  // Dados temporários para testar o front-end.
  const [products, setProducts] = useState([
    {
      id: 1,
      descricao: "Brinco Dourado",
      preco: "49.90",
      quantidade: 10,
      imagem: "",
    },
    {
      id: 2,
      descricao: "Colar Dourado",
      preco: "69.90",
      quantidade: 5,
      imagem: "",
    },
    {
      id: 3,
      descricao: "Pulseira Dourada",
      preco: "39.90",
      quantidade: 0,
      imagem: "",
    },
    {
      id: 4,
      descricao: "Anel Dourado",
      preco: "34.90",
      quantidade: 8,
      imagem: "",
    },
    {
      id: 5,
      descricao: "Brinco Pérola",
      preco: "54.90",
      quantidade: 3,
      imagem: "",
    },
  ]);

  // Filtra os produtos por descrição e disponibilidade.
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.descricao
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

  // Abre o formulário para cadastrar um novo produto.
  function handleAdd() {
    setEditingProduct(null);
    setIsFormOpen(true);
  }

  // Abre o formulário preenchido com os dados do produto.
  function handleEdit(product) {
    setEditingProduct(product);
    setIsFormOpen(true);
  }

  // Salva um produto novo ou atualiza um produto existente.
  function handleSave(productData) {
    if (editingProduct) {
      // Atualiza somente o produto selecionado.
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProduct.id
            ? { ...product, ...productData }
            : product
        )
      );
    } else {
      // Cria um novo produto com um identificador temporário.
      const newProduct = {
        id: Date.now(),
        ...productData,
      };

      setProducts((currentProducts) => [
        ...currentProducts,
        newProduct,
      ]);
    }

    // Fecha o formulário após salvar.
    setIsFormOpen(false);
    setEditingProduct(null);
  }

  // Exclui um produto após confirmação.
  function handleDelete(id) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmed) {
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id)
    );
  }

  // Fecha o formulário e limpa o produto selecionado.
  function handleCancelForm() {
    setIsFormOpen(false);
    setEditingProduct(null);
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <AdminHeader />

        <main className="products-page">
          <div className="products-page-header">
            <div>
              <p className="dashboard-eyebrow">
                GERENCIAMENTO
              </p>

              <h1>Produtos</h1>

              <p>
                Cadastre, edite e gerencie os produtos
                do catálogo.
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
                  Status
                </label>

                <select
                  id="product-filter"
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                >
                  <option value="todos">Todos</option>

                  <option value="disponiveis">
                    Disponíveis
                  </option>

                  <option value="indisponiveis">
                    Indisponíveis
                  </option>
                </select>
              </div>
            </div>

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
          </section>
        </main>
      </div>

      {/* Formulário de cadastro e edição */}
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
