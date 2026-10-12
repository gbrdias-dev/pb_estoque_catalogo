import "./product_search.css";

function ProductSearch({ searchTerm, onSearchChange }) {
  return (
    <div className="product-search">
      <label
        htmlFor="product-search-input"
        className="product-search-label"
      >
        Buscar produto
      </label>

      <div className="product-search-box">
        <input
          id="product-search-input"
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Digite o nome do produto..."
        />

        <span className="product-search-icon">
          🔍
        </span>
      </div>
    </div>
  );
}

export default ProductSearch;