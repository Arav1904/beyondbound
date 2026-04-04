const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function apiRequest(path, { method = "GET", token, body } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error || payload?.message || "Request failed";
    throw new Error(message);
  }

  return payload?.data ?? payload;
}

export async function signInWithGoogle({ credential, guestCartItems = [] }) {
  return apiRequest("/auth/google", {
    method: "POST",
    body: { credential, guestCartItems },
  });
}

export async function getCurrentSession(token) {
  return apiRequest("/auth/me", { token });
}

export async function updateProfile(token, profile) {
  return apiRequest("/auth/profile", {
    method: "PUT",
    token,
    body: profile,
  });
}

export async function getCart(token) {
  return apiRequest("/cart", { token });
}

export async function addCartItem(token, item) {
  return apiRequest("/cart/items", {
    method: "POST",
    token,
    body: item,
  });
}

export async function updateCartItem(token, itemId, quantity) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: "PATCH",
    token,
    body: { quantity },
  });
}

export async function removeCartItem(token, itemId) {
  return apiRequest(`/cart/items/${itemId}`, {
    method: "DELETE",
    token,
  });
}

export async function clearServerCart(token) {
  return apiRequest("/cart", {
    method: "DELETE",
    token,
  });
}

export async function mergeGuestCart(token, items) {
  return apiRequest("/cart/merge", {
    method: "POST",
    token,
    body: { items },
  });
}

export async function placeOrder(token, payload = {}) {
  return apiRequest("/orders/place", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function fetchMyOrders(token, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return apiRequest(`/orders/my${queryString ? `?${queryString}` : ""}`, { token });
}

export { API_BASE_URL };
