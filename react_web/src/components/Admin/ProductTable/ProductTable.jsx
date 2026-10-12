import "./ProductTable.css";

function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="product-table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Preço</th>
            <th>Quantidade</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="admin-product-info">
                    <div className="admin-product-image">
                      {product.imagem ? (
                        <img
                          src={product.imagem}
                          alt={product.descricao}
                        />
                      ) : (
                        <span>Sem foto</span>
                      )}
                    </div>

                    <strong>{product.descricao}</strong>
                  </div>
                </td>

                <td>
                  R$ {Number(product.preco)
                    .toFixed(2)
                    .replace(".", ",")}
                </td>

                <td>
                  {product.quantidade}
                </td>

                <td>
                  {product.quantidade > 0 ? (
                    <span className="product-status available">
                      Disponível
                    </span>
                  ) : (
                    <span className="product-status unavailable">
                      Indisponível
                    </span>
                  )}
                </td>

                <td>
                  <div className="product-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => onEdit(product)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => onDelete(product.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="product-table-empty"
              >
                Nenhum produto encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;