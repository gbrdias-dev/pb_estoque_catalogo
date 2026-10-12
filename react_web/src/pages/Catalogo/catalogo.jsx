import { useMemo, useState } from "react";

import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";

import ProductCard from "../../components/Catalogo/ProductCard/product_card";
import ProductFilter from "../../components/Catalogo/ProductFilter/product_filter";
import ProductSearch from "../../components/Catalogo/ProductSearch/product_search";

import "./catalogo.css";

function Catalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("todos");

  // Dados temporários.
  // Posteriormente serão substituídos pelos dados vindos da API.
  const products = [
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
    {
      id: 6,
      descricao: "Colar com Pingente",
      preco: "79.90",
      quantidade: 0,
      imagem: "",
    },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.descricao
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
            <p className="catalog-eyebrow">
              P&B BIJUTERIAS
            </p>

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
                  Tente buscar por outro produto ou
                  alterar o filtro selecionado.
                </p>
              </div>
            )}

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Catalog;