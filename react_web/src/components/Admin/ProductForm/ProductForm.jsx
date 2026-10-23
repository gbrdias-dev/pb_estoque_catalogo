
import { useEffect, useState } from "react";
import {
  getCategories,
  getCollections,
  createCollection,
  getSuppliers,
} from "../../../services/api";
import "./ProductForm.css";

const initialForm = {
  descricao: "",
  preco: "",
  quantidade: "0",
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Carrega categorias, coleções e fornecedoras pela API.
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
        if (active) setLoadingOptions(false);
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  // Preenche o formulário ao editar um produto.
  // A quantidade em estoque não é editada nesta tela.
  useEffect(() => {
    if (product) {
      setFormData({
        descricao: product.descricao ?? "",
        preco: product.preco ?? "",
        id_categoria: product.id_categoria ?? "",
        id_colecao: product.id_colecao ?? "",
        id_fornecedora: product.id_fornecedora ?? "",
        url_fornecedor: product.url_fornecedor ?? "",
      });

      setImagePreview(product.imagem ?? "");
    } else {
      setFormData({ ...initialForm });
      setImagePreview("");
    }

    setImageFile(null);
    setError("");
  }, [product]);

  // Libera URLs temporárias de imagens.
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleCreateCollection() {
    const nome = newCollectionName.trim();

    if (!nome) {
      setError("Informe o nome da coleção.");
      return;
    }

    setCreatingCollection(true);
    setError("");

    try {
      const created = await createCollection({ nome });
      const newCollection = created?.results?.[0] ?? created;

      if (!newCollection?.id) {
        throw new Error(
          "A coleção foi enviada, mas a API não retornou seu ID."
        );
      }

      setCollections((current) => [
        ...current.filter((item) => item.id !== newCollection.id),
        newCollection,
      ]);

      setFormData((current) => ({
        ...current,
        id_colecao: String(newCollection.id),
      }));

      setNewCollectionName("");
      setShowCollectionForm(false);
    } catch (err) {
      const detail =
        err.data && typeof err.data === "object"
          ? Object.values(err.data).flat().join(" ")
          : "";

      setError(
        detail || err.message || "Não foi possível criar a coleção."
      );
    } finally {
      setCreatingCollection(false);
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      setImageFile(null);
      setImagePreview(product?.imagem ?? "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem válido.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const preco = Number(formData.preco);

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
      setError("Informe um preço de venda válido.");
      return;
    }

    // A quantidade inicial só pode ser informada ao cadastrar.
    const quantidadeInicial = Number(formData.quantidade);

    if (
      !product &&
      (
        formData.quantidade === "" ||
        !Number.isInteger(quantidadeInicial) ||
        quantidadeInicial < 0
      )
    ) {
      setError(
        "Informe uma quantidade inicial inteira igual ou maior que zero."
      );
      return;
    }

    if (
      !formData.id_categoria ||
      !formData.id_colecao ||
      !formData.id_fornecedora
    ) {
      setError(
        "Selecione uma categoria, uma coleção e uma fornecedora."
      );
      return;
    }

    // Envia os dados do produto sem alterar a quantidade em estoque.
    const productData = new FormData();

    productData.append("descricao", formData.descricao.trim());
    productData.append("preco", preco.toFixed(2));

    // Envia a quantidade somente na criação; edição não altera o estoque.
    if (!product) {
      productData.append("quantidade", String(quantidadeInicial));
    }

    productData.append("id_categoria", String(formData.id_categoria));
    productData.append("id_colecao", String(formData.id_colecao));
    productData.append(
      "id_fornecedora",
      String(formData.id_fornecedora)
    );
    productData.append(
      "url_fornecedor",
      formData.url_fornecedor.trim()
    );

    if (imageFile) {
      productData.append("imagem", imageFile);
    }

    try {
      setSaving(true);
      await onSave(productData);
    } catch (err) {
      const details =
        err.data && typeof err.data === "object"
          ? Object.entries(err.data)
              .map(([field, messages]) => {
                const text = Array.isArray(messages)
                  ? messages.join(" ")
                  : String(messages);

                return `${field}: ${text}`;
              })
              .join(" ")
          : "";

      setError(
        details || err.message || "Não foi possível salvar o produto."
      );
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

                <div className="product-form-field full-width">
                  <label htmlFor="imagem">Foto do produto</label>

                  <input
                    id="imagem"
                    name="imagem"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  <small>
                    Formatos de imagem aceitos; tamanho máximo de 5 MB.
                  </small>

                  {imagePreview && (
                    <div className="product-image-preview">
                      <img
                        src={imagePreview}
                        alt={`Prévia de ${
                          formData.descricao || "produto"
                        }`}
                        style={{
                          display: "block",
                          width: "150px",
                          height: "150px",
                          marginTop: "12px",
                          objectFit: "contain",
                          borderRadius: "8px",
                        }}
                      />

                      {imageFile && (
                        <button
                          type="button"
                          className="product-form-cancel"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(product?.imagem ?? "");

                            const input =
                              document.getElementById("imagem");

                            if (input) input.value = "";
                          }}
                        >
                          Remover nova foto
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="product-form-field full-width">
                  <label htmlFor="preco">
                    Preço de venda (R$) *
                  </label>

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

                {!product && (
                  <div className="product-form-field">
                    <label htmlFor="quantidade">
                      Quantidade inicial em estoque *
                    </label>

                    <input
                      id="quantidade"
                      name="quantidade"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.quantidade}
                      onChange={handleChange}
                      placeholder="Ex.: 10"
                      required
                    />

                    <small>
                      Depois do cadastro, altere o estoque somente na tela Estoque.
                    </small>
                  </div>
                )}

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

                  <button
                    type="button"
                    className="product-form-cancel"
                    onClick={() => {
                      setError("");
                      setShowCollectionForm((current) => !current);
                    }}
                    style={{ marginTop: "8px" }}
                  >
                    {showCollectionForm
                      ? "Cancelar criação"
                      : "+ Criar coleção"}
                  </button>

                  {showCollectionForm && (
                    <div
                      className="collection-create-form"
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        marginTop: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <input
                        type="text"
                        value={newCollectionName}
                        onChange={(event) =>
                          setNewCollectionName(event.target.value)
                        }
                        placeholder="Nome da nova coleção"
                        maxLength={100}
                        aria-label="Nome da nova coleção"
                        required
                      />

                      <button
                        type="button"
                        className="product-form-submit"
                        onClick={handleCreateCollection}
                        disabled={creatingCollection}
                      >
                        {creatingCollection
                          ? "Criando..."
                          : "Salvar coleção"}
                      </button>

                      <button
                        type="button"
                        className="product-form-cancel"
                        onClick={() => {
                          setShowCollectionForm(false);
                          setNewCollectionName("");
                          setError("");
                        }}
                        disabled={creatingCollection}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
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
                    Campo opcional para registrar o link do produto no
                    site do fornecedor.
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
              disabled={loadingOptions || !optionsReady || saving}
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