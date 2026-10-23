import "./ProductTable.css";

function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="product-table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Preço de venda</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {products.length > 0 ? (
            products.map((product) => {
              const quantidade = Number(product.quantidade) || 0;
              const podeExcluir = quantidade === 0;

              return (
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
                    R${" "}
                    {Number(product.preco)
                      .toFixed(2)
                      .replace(".", ",")}
                  </td>

                  <td>
                    {quantidade > 0 ? (
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
                        disabled={!podeExcluir}
                        title={
                          podeExcluir
                            ? "Excluir produto"
                            : "Só é possível excluir produtos sem estoque."
                        }
                        onClick={() => onDelete(product.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="product-table-empty">
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