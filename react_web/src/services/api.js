const API_URL = "http://127.0.0.1:8000/api";

/**
 * Função base para realizar requisições à API.
 */
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `Erro na API: ${response.status} ${response.statusText}`
    );
  }

  // Algumas requisições podem não retornar conteúdo.
  if (response.status === 204) {
    return null;
  }

  return response.json();
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
  return apiRequest("/produtos/", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

/**
 * Atualiza um produto.
 */
export async function updateProduct(id, product) {
  return apiRequest(`/produtos/${id}/`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
}

/**
 * Remove um produto.
 */
export async function deleteProduct(id) {
  return apiRequest(`/produtos/${id}/`, {
    method: "DELETE",
  });
}