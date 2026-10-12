import { useEffect, useState } from "react";
import "./ProductForm.css";

const initialForm = {
  descricao: "",
  preco: "",
  quantidade: "",
  imagem: "",
};

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");

  // Preenche o formulário ao editar um produto.
  // Ao cadastrar um novo, mantém os campos vazios.
  useEffect(() => {
    if (product) {
      setFormData({
        descricao: product.descricao ?? "",
        preco: product.preco ?? "",
        quantidade: product.quantidade ?? "",
        imagem: product.imagem ?? "",
      });
    } else {
      setFormData(initialForm);
    }

    setError("");
  }, [product]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const preco = Number(formData.preco);
    const quantidade = Number(formData.quantidade);

    if (!formData.descricao.trim()) {
      setError("Informe a descrição do produto.");
      return;
    }

    if (formData.preco === "" || !Number.isFinite(preco) || preco < 0) {
      setError("Informe um preço válido.");
      return;
    }

    if (
      formData.quantidade === "" ||
      !Number.isInteger(quantidade) ||
      quantidade < 0
    ) {
      setError("Informe uma quantidade inteira igual ou maior que zero.");
      return;
    }

    // Envia os dados para a página que controla os produtos.
    onSave({
      ...formData,
      descricao: formData.descricao.trim(),
      preco: preco.toFixed(2),
      quantidade,
    });
  }

  return (
    <div className="product-form-overlay">
      <section
        className="product-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        <div className="product-form-header">
          <div>
            <p className="product-form-eyebrow">
              GERENCIAMENTO DE ESTOQUE
            </p>

            <h2 id="product-form-title">
              {product ? "Editar produto" : "Novo produto"}
            </h2>

            <p>
              Preencha as informações do produto abaixo.
            </p>
          </div>

          <button
            type="button"
            className="product-form-close"
            onClick={onCancel}
            aria-label="Fechar formulário"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="product-form-fields">
            <div className="product-form-field full-width">
              <label htmlFor="descricao">Descrição do produto *</label>

              <input
                id="descricao"
                name="descricao"
                type="text"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Ex.: Brinco dourado"
                maxLength={150}
                required
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="preco">Preço (R$) *</label>

              <input
                id="preco"
                name="preco"
                type="number"
                min="0"
                step="0.01"
                value={formData.preco}
                onChange={handleChange}
                placeholder="49.90"
                required
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="quantidade">Quantidade em estoque *</label>

              <input
                id="quantidade"
                name="quantidade"
                type="number"
                min="0"
                step="1"
                value={formData.quantidade}
                onChange={handleChange}
                placeholder="10"
                required
              />
            </div>

            <div className="product-form-field full-width">
              <label htmlFor="imagem">URL da imagem</label>

              <input
                id="imagem"
                name="imagem"
                type="url"
                value={formData.imagem}
                onChange={handleChange}
                placeholder="https://exemplo.com/imagem.jpg"
              />

              <small>
                Campo opcional. Poderemos implementar o envio de arquivos
                de imagem posteriormente.
              </small>
            </div>
          </div>

          {error && (
            <p className="product-form-error" role="alert">
              {error}
            </p>
          )}

          <div className="product-form-actions">
            <button
              type="button"
              className="product-form-cancel"
              onClick={onCancel}
            >
              Cancelar
            </button>

            <button type="submit" className="product-form-submit">
              {product ? "Salvar alterações" : "Cadastrar produto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProductForm;
