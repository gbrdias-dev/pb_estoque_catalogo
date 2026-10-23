
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

  // Não força JSON quando o corpo é FormData.
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
 * Não definir Content-Type manualmente: o navegador inclui o boundary.
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

export async function createCollection(collection) {
  return csrfRequest("/colecoes/", {
    method: "POST",
    body: JSON.stringify(collection),
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
 * A senha deve ser protegida por hash no backend.
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
