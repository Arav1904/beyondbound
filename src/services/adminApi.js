const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:5000/api";

const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

    if (!isLocalhost) {
      return `${normalizeBaseUrl(window.location.origin)}/api`;
    }
  }

  return DEFAULT_LOCAL_API_BASE_URL;
};

const API_BASE_URL = resolveApiBaseUrl();

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

async function apiRequest(path, { method = "GET", token, body } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      `Cannot reach backend API at ${API_BASE_URL}. Please ensure the backend server is running.`,
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error || payload?.message || "Request failed";
    throw new Error(message);
  }

  return payload;
}

export async function submitSupportTicket(payload) {
  return apiRequest("/support", {
    method: "POST",
    body: payload,
  });
}

export async function placeOrder(token, payload = {}) {
  return apiRequest("/orders/preorder", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function fetchMyOrders(token, params = {}) {
  return apiRequest(`/orders/my${buildQuery(params)}`, { token });
}

export async function fetchAdminOverview(token) {
  return apiRequest("/admin/overview", { token });
}

export async function fetchAdminAnalytics(token, params = {}) {
  return apiRequest(`/admin/analytics${buildQuery(params)}`, { token });
}

export async function fetchAdminAuditLogs(token, params = {}) {
  return apiRequest(`/admin/audit-logs${buildQuery(params)}`, { token });
}

export async function fetchAdminUsers(token, params = {}) {
  return apiRequest(`/admin/users${buildQuery(params)}`, { token });
}

export async function updateAdminUser(token, userId, payload) {
  return apiRequest(`/admin/users/${userId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export async function fetchAdminOrders(token, params = {}) {
  return apiRequest(`/admin/orders${buildQuery(params)}`, { token });
}

export async function updateAdminOrderStatus(token, orderId, payload) {
  return apiRequest(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export async function fetchAdminProducts(token, params = {}) {
  return apiRequest(`/admin/products${buildQuery(params)}`, { token });
}

export async function createAdminProduct(token, payload) {
  return apiRequest("/admin/products", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateAdminProduct(token, productId, payload) {
  return apiRequest(`/admin/products/${productId}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function archiveAdminProduct(token, productId) {
  return apiRequest(`/admin/products/${productId}`, {
    method: "DELETE",
    token,
  });
}

export async function fetchAdminSupportTickets(token, params = {}) {
  return apiRequest(`/admin/support${buildQuery(params)}`, { token });
}

export async function updateAdminSupportTicket(token, ticketId, payload) {
  return apiRequest(`/admin/support/${ticketId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export async function fetchAdminTestimonials(token, params = {}) {
  return apiRequest(`/admin/testimonials${buildQuery(params)}`, { token });
}

export async function updateAdminTestimonial(token, testimonialId, payload) {
  return apiRequest(`/testimonials/admin/${testimonialId}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function deleteAdminTestimonial(token, testimonialId) {
  return apiRequest(`/testimonials/admin/${testimonialId}`, {
    method: "DELETE",
    token,
  });
}

export { API_BASE_URL };
