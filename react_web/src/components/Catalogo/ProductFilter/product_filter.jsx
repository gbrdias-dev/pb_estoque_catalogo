import "./product_filter.css";

function ProductFilter({ selectedFilter, onFilterChange }) {
  const filters = [
    {
      value: "todos",
      label: "Todos",
    },
    {
      value: "disponiveis",
      label: "Disponíveis",
    },
    {
      value: "indisponiveis",
      label: "Indisponíveis",
    },
  ];

  return (
    <div className="product-filter">
      <p className="product-filter-title">
        Filtrar produtos
      </p>

      <div className="product-filter-options">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`product-filter-button ${
              selectedFilter === filter.value ? "active" : ""
            }`}
            onClick={() => onFilterChange(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;