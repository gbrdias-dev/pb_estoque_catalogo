
import { useEffect, useMemo, useState } from "react";

import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";

import ProductCard from "../../components/Catalogo/ProductCard/product_card";
import ProductFilter from "../../components/Catalogo/ProductFilter/product_filter";
import ProductSearch from "../../components/Catalogo/ProductSearch/product_search";

import { getProducts } from "../../services/api";

import "./catalogo.css";

function Catalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        // A API do Django REST Framework retorna
        // uma lista ou, com paginação, um objeto com results.
        const productList = Array.isArray(data)
          ? data
          : data.results;

        setProducts(Array.isArray(productList) ? productList : []);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        setError("Não foi possível carregar os produtos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const descricao = product.descricao ?? "";

      const matchesSearch = descricao
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let matchesFilter = true;

      if (filter === "disponiveis") {
        matchesFilter = product.quantidade > 0;
      }

      if (filter === "indisponiveis") {
        matchesFilter = product.quantidade === 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, filter]);

  return (
    <>
      <Header />

      <main className="catalog">
        <section className="catalog-header">
          <div className="catalog-header-container">
            <p className="catalog-eyebrow">P&B BIJUTERIAS</p>

            <h1>
              Nosso <span>catálogo</span>
            </h1>

            <p className="catalog-description">
              Encontre acessórios que combinam com seu estilo
              e descubra peças para todos os momentos.
            </p>
          </div>
        </section>

        <section className="catalog-products">
          <div className="catalog-container">
            <div className="catalog-controls">
              <ProductSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />

              <ProductFilter
                selectedFilter={filter}
                onFilterChange={setFilter}
              />
            </div>

            {loading ? (
              <div className="catalog-empty">
                <p>Carregando produtos...</p>
              </div>
            ) : error ? (
              <div className="catalog-empty">
                <h2>Ops! Ocorreu um problema.</h2>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="catalog-results">
                  <p>
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1
                      ? "produto encontrado"
                      : "produtos encontrados"}
                  </p>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="product-grid">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="catalog-empty">
                    <h2>Nenhum produto encontrado</h2>
                    <p>
                      {products.length === 0
                        ? "Nosso catálogo está sendo preparado. Em breve teremos novidades!"
                        : "Tente buscar por outro produto ou alterar o filtro selecionado."}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Catalog;
