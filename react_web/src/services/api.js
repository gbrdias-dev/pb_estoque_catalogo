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
 * Função base para realizar requisições à API.
 */
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.detail || `Erro na API: ${response.status} ${response.statusText}`
    );

    error.status = response.status;
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

/* =========================
   AUTENTICAÇÃO
========================= */

/**
 * Login do administrador pela tabela usuario.
 */
export async function loginAdmin(email, password) {
  return csrfRequest("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Consulta a sessão atual.
 */
export async function getAdminSession() {
  return apiRequest("/auth/session/");
}

/**
 * Encerra a sessão do administrador.
 */
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
 * Busca todos os produtos.
 */
export async function getProducts() {
  return apiRequest("/produtos/");
}

/**
 * Busca um produto pelo ID.
 */
export async function getProductById(id) {
  return apiRequest(`/produtos/${id}/`);
}

/**
 * Cria um novo produto.
 */
export async function createProduct(product) {
  return csrfRequest("/produtos/", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

/**
 * Atualiza um produto.
 */
export async function updateProduct(id, product) {
  return csrfRequest(`/produtos/${id}/`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
}


/**
 * Atualiza somente a quantidade em estoque de um produto.
 */
export async function updateProductStock(id, quantidade) {
  return csrfRequest(`/produtos/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ quantidade }),
  });
}


/**
 * Remove um produto.
 */
export async function deleteProduct(id) {
  return csrfRequest(`/produtos/${id}/`, {
    method: "DELETE",
  });
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
 * Exclui um fornecedor.
 */
export async function deleteSupplier(id) {
  return csrfRequest(`/fornecedoras/${id}/`, {
    method: "DELETE",
  });
}


