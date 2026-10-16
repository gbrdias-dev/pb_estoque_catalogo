import { useEffect, useState } from "react";
import {
  getCategories,
  getCollections,
  getSuppliers,
} from "../../../services/api";
import "./ProductForm.css";

const initialForm = {
  descricao: "",
  preco: "",
  quantidade: "",
  id_categoria: "",
  id_colecao: "",
  id_fornecedora: "",
  url_fornecedor: "",
};

function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialForm);

  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Carrega as opções disponíveis no PostgreSQL através da API.
  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setLoadingOptions(true);
      setError("");

      try {
        const [categoriesData, collectionsData, suppliersData] =
          await Promise.all([
            getCategories(),
            getCollections(),
            getSuppliers(),
          ]);

        if (!active) return;

        setCategories(getList(categoriesData));
        setCollections(getList(collectionsData));
        setSuppliers(getList(suppliersData));
      } catch (err) {
        console.error("Erro ao carregar opções do produto:", err);

        if (active) {
          setError(
            "Não foi possível carregar categorias, coleções e fornecedoras."
          );
        }
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  // Preenche o formulário quando um produto é selecionado para edição.
  useEffect(() => {
    if (product) {
      setFormData({
        descricao: product.descricao ?? "",
        preco: product.preco ?? "",
        quantidade: product.quantidade ?? "",
        id_categoria: product.id_categoria ?? "",
        id_colecao: product.id_colecao ?? "",
        id_fornecedora: product.id_fornecedora ?? "",
        url_fornecedor: product.url_fornecedor ?? "",
      });
    } else {
      setFormData({ ...initialForm });
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const preco = Number(formData.preco);
    const quantidade = Number(formData.quantidade);

    if (!formData.descricao.trim()) {
      setError("Informe a descrição do produto.");
      return;
    }

    if (formData.descricao.trim().length > 500) {
      setError("A descrição deve ter no máximo 500 caracteres.");
      return;
    }

    if (
      formData.preco === "" ||
      !Number.isFinite(preco) ||
      preco < 0
    ) {
      setError("Informe um preço válido.");
      return;
    }

    if (
      formData.quantidade === "" ||
      !Number.isInteger(quantidade) ||
      quantidade < 0
    ) {
      setError(
        "Informe uma quantidade inteira igual ou maior que zero."
      );
      return;
    }

    if (
      !formData.id_categoria ||
      !formData.id_colecao ||
      !formData.id_fornecedora
    ) {
      setError("Selecione uma categoria, uma coleção e uma fornecedora.");
      return;
    }

    const productData = {
      descricao: formData.descricao.trim(),
      preco: preco.toFixed(2),
      quantidade,
      id_categoria: Number(formData.id_categoria),
      id_colecao: Number(formData.id_colecao),
      id_fornecedora: Number(formData.id_fornecedora),
      url_fornecedor: formData.url_fornecedor.trim() || null,
    };

    try {
      setSaving(true);
      await onSave(productData);
    } catch (err) {
      setError(err.message || "Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  }

  const optionsReady =
    !loadingOptions &&
    categories.length > 0 &&
    collections.length > 0 &&
    suppliers.length > 0;

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

            <p>Preencha as informações do produto abaixo.</p>
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
          {loadingOptions ? (
            <p>Carregando categorias, coleções e fornecedoras...</p>
          ) : (
            <>
              <div className="product-form-fields">
                <div className="product-form-field full-width">
                  <label htmlFor="descricao">
                    Descrição do produto *
                  </label>

                  <input
                    id="descricao"
                    name="descricao"
                    type="text"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Ex.: Brinco dourado"
                    maxLength={500}
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
                  <label htmlFor="quantidade">
                    Quantidade em estoque *
                  </label>

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

                <div className="product-form-field">
                  <label htmlFor="id_categoria">Categoria *</label>

                  <select
                    id="id_categoria"
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={handleChange}
                    required
                    disabled={categories.length === 0}
                  >
                    <option value="">Selecione uma categoria</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="product-form-field">
                  <label htmlFor="id_colecao">Coleção *</label>

                  <select
                    id="id_colecao"
                    name="id_colecao"
                    value={formData.id_colecao}
                    onChange={handleChange}
                    required
                    disabled={collections.length === 0}
                  >
                    <option value="">Selecione uma coleção</option>

                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="product-form-field full-width">
                  <label htmlFor="id_fornecedora">
                    Fornecedora *
                  </label>

                  <select
                    id="id_fornecedora"
                    name="id_fornecedora"
                    value={formData.id_fornecedora}
                    onChange={handleChange}
                    required
                    disabled={suppliers.length === 0}
                  >
                    <option value="">Selecione uma fornecedora</option>

                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="product-form-field full-width">
                  <label htmlFor="url_fornecedor">
                    URL do fornecedor
                  </label>

                  <input
                    id="url_fornecedor"
                    name="url_fornecedor"
                    type="url"
                    value={formData.url_fornecedor}
                    onChange={handleChange}
                    placeholder="https://exemplo.com/produto"
                  />

                  <small>
                    Campo opcional para registrar o link do produto
                    no site do fornecedor.
                  </small>
                </div>
              </div>

              {!optionsReady && !error && (
                <p className="product-form-error" role="alert">
                  Para cadastrar produtos, é necessário ter pelo menos
                  uma categoria, uma coleção e uma fornecedora
                  cadastradas.
                </p>
              )}
            </>
          )}

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
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="product-form-submit"
              disabled={
                loadingOptions ||
                !optionsReady ||
                saving
              }
            >
              {saving
                ? "Salvando..."
                : product
                  ? "Salvar alterações"
                  : "Cadastrar produto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProductForm;
