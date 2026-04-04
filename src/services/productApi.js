import { API_BASE_URL } from "./cartApi";

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

async function apiRequest(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error || payload?.message || "Request failed";
    throw new Error(message);
  }

  return payload?.data ?? payload;
}

export async function fetchPrimaryProduct() {
  return apiRequest("/products/featured/primary");
}

export async function fetchPublicProducts(params = {}) {
  return apiRequest(`/products${buildQuery(params)}`);
}

export async function fetchPublicProduct(identifier) {
  return apiRequest(`/products/${encodeURIComponent(String(identifier || "").trim())}`);
}
