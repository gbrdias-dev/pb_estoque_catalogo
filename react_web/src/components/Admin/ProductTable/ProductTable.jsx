import "./ProductTable.css";

function ProductTable({
  products,
  onEdit,
  onDelete,
  onReactivate,
}) {
  return (
    <div className="product-table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Preço de venda</th>
            <th>Status do estoque</th>
            <th>Status do cadastro</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {products.length > 0 ? (
            products.map((product) => {
              const quantidade = Number(product.quantidade) || 0;
              const ativo = product.ativo === true;
              const podeDesativar = ativo && quantidade === 0;

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
                        {quantidade} em estoque
                      </span>
                    ) : (
                      <span className="product-status unavailable">
                        Sem estoque
                      </span>
                    )}
                  </td>

                  <td>
                    <span
                      className={`product-status ${
                        ativo ? "available" : "unavailable"
                      }`}
                    >
                      {ativo ? "Ativo" : "Inativo"}
                    </span>
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

                      {ativo ? (
                        <button
                          type="button"
                          className="delete-button"
                          disabled={!podeDesativar}
                          title={
                            podeDesativar
                              ? "Desativar produto"
                              : "Só é possível desativar produtos sem estoque."
                          }
                          onClick={() => onDelete(product.id)}
                        >
                          Desativar
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => onReactivate(product.id)}
                        >
                          Reativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="product-table-empty">
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
