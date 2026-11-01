const API_URL = "http://localhost:8000/api";

let csrfToken = null;

/**
 * Obtém o token CSRF do Django.
 */
async function getCsrfToken() {
  const response = await fetch(`${API_URL}/auth/csrf/`, {
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.csrfToken) {
    throw new Error("Não foi possível obter o token de segurança.");
  }

  csrfToken = data.csrfToken;
  return csrfToken;
}

/**
 * Função base para realizar requisições JSON à API.
 */
async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.detail ||
        (typeof data === "object" ? JSON.stringify(data) : data) ||
        `Erro na API: ${response.status} ${response.statusText}`
    );

    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Executa uma requisição que exige CSRF.
 */
async function csrfRequest(endpoint, options = {}) {
  const token = await getCsrfToken();

  return apiRequest(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      "X-CSRFToken": token,
    },
  });
}

/**
 * Executa requisições com arquivos usando FormData.
 */
async function csrfFormRequest(endpoint, formData, method = "POST") {
  const token = await getCsrfToken();

  return apiRequest(endpoint, {
    method,
    headers: {
      "X-CSRFToken": token,
    },
    body: formData,
  });
}

/* =========================
   AUTENTICAÇÃO
========================= */

export async function loginAdmin(email, password) {
  return csrfRequest("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getAdminSession() {
  return apiRequest("/auth/session/");
}

export async function logoutAdmin() {
  return csrfRequest("/auth/logout/", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/* =========================
   PRODUTOS
========================= */

/**
 * Busca produtos ativos para o catálogo público.
 *
 * Observação: este filtro é aplicado no frontend.
 * O ideal é também filtrar os produtos ativos no backend.
 */
export async function getProducts() {
  const data = await apiRequest("/produtos/");
  const products = Array.isArray(data) ? data : data.results || [];

  return products.filter((product) => product.ativo === true);
}

/**
 * Busca todos os produtos, ativos e inativos,
 * para o painel administrativo.
 */
export async function getAllProductsAdmin() {
  return apiRequest("/produtos/");
}

/**
 * Busca um produto pelo ID.
 */
export async function getProductById(id) {
  return apiRequest(`/produtos/${id}/`);
}


/**
 * Busca o histórico de reposições de um produto.
 */
export async function getProductHistory(id) {
  return apiRequest(`/produtos/${id}/historico/`);
}


/**
 * Cria um produto com JSON ou FormData.
 */
export async function createProduct(product) {
  if (product instanceof FormData) {
    return csrfFormRequest("/produtos/", product, "POST");
  }

  return csrfRequest("/produtos/", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

/**
 * Atualiza um produto com JSON ou FormData.
 */
export async function updateProduct(id, product) {
  if (product instanceof FormData) {
    return csrfFormRequest(`/produtos/${id}/`, product, "PATCH");
  }

  return csrfRequest(`/produtos/${id}/`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
}

/**
 * Atualiza somente a quantidade em estoque.
 */
export async function updateProductStock(id, quantidade) {
  return csrfRequest(`/produtos/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ quantidade }),
  });
}

/**
 * Registra uma reposição e atualiza o estoque no backend.
 */
export async function reporEstoque(id, quantidade, valorCompra) {
  return csrfRequest(`/produtos/${id}/repor-estoque/`, {
    method: "POST",
    body: JSON.stringify({
      quantidade: Number(quantidade),
      valor_compra: String(valorCompra),
    }),
  });
}

/**
 * Registra uma saída e subtrai a quantidade do estoque no backend.
 */
export async function darBaixaEstoque(id, quantidade) {
  return csrfRequest(`/produtos/${id}/registrar-saida/`, {
    method: "POST",
    body: JSON.stringify({
      quantidade: Number(quantidade),
    }),
  });
}

/**
 * Desativa um produto sem excluir seu registro
 * nem o histórico de reposições.
 */
export async function deactivateProduct(id) {
  return csrfRequest(`/produtos/${id}/desativar/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function reactivateProduct(id) {
  return csrfRequest(`/produtos/${id}/reativar/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/**
 * Mantida temporariamente por compatibilidade.
 *
 * Não exclui mais o produto fisicamente.
 * Solicita sua desativação lógica.
 */
export async function deleteProduct(id) {
  return deactivateProduct(id);
}


/* =========================
   COLEÇÕES
========================= */

/**
 * Cadastra uma nova coleção.
 */
export async function createCollection(collection) {
  return csrfRequest("/colecoes/", {
    method: "POST",
    body: JSON.stringify(collection),
  });
}

/**
 * Atualiza os dados de uma coleção.
 */
export async function updateCollection(id, collection) {
  return csrfRequest(`/colecoes/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(collection),
  });
}

/**
 * Inativa uma coleção sem excluir seu registro
 * nem os produtos associados.
 */
export async function deactivateCollection(id) {
  return csrfRequest(`/colecoes/${id}/desativar/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/**
 * Reativa uma coleção anteriormente inativada.
 */
export async function reactivateCollection(id) {
  return csrfRequest(`/colecoes/${id}/reativar/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/**
 * Mantida temporariamente por compatibilidade.
 * Solicita a inativação lógica da coleção.
 */
export async function deleteCollection(id) {
  return deactivateCollection(id);
}


/* =========================
   DADOS AUXILIARES
========================= */

export async function getCategories() {
  return apiRequest("/categorias/");
}

export async function getCollections() {
  return apiRequest("/colecoes/");
}

export async function getSuppliers() {
  return apiRequest("/fornecedoras/");
}

/**
 * Cadastra um fornecedor.
 */
export async function createSupplier(supplier) {
  return csrfRequest("/fornecedoras/", {
    method: "POST",
    body: JSON.stringify(supplier),
  });
}

/**
 * Atualiza os dados de um fornecedor.
 */
export async function updateSupplier(id, supplier) {
  return csrfRequest(`/fornecedoras/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(supplier),
  });
}


/**
 * Inativa um fornecedor sem excluir seu registro.
 */
export async function deactivateSupplier(id) {
  return csrfRequest(`/fornecedoras/${id}/desativar/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

/**
 * Reativa um fornecedor anteriormente inativado.
 */
export async function reactivateSupplier(id) {
  return csrfRequest(`/fornecedoras/${id}/reativar/`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}


/* =========================
   USUÁRIOS ADMINISTRATIVOS
========================= */

/**
 * Lista os usuários cadastrados.
 */
export async function getUsers() {
  return apiRequest("/usuarios/");
}

/**
 * Cadastra um novo usuário administrador.
 */
export async function createUser(user) {
  return csrfRequest("/usuarios/", {
    method: "POST",
    body: JSON.stringify({
      nome: user.nome,
      email: user.email,
      senha: user.senha,
    }),
  });
}

/**
 * Atualiza nome e e-mail de um usuário.
 */
export async function updateUser(id, user) {
  return csrfRequest(`/usuarios/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({
      nome: user.nome,
      email: user.email,
    }),
  });
}

/**
 * Redefine a senha de um usuário administrador.
 */
export async function resetUserPassword(id, senha, confirmarSenha) {
  return csrfRequest(`/usuarios/${id}/redefinir-senha/`, {
    method: "POST",
    body: JSON.stringify({
      senha,
      confirmar_senha: confirmarSenha,
    }),
  });
}
