const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dev-management-digital-v1.crisu.qzz.io';

async function request(path, { method, body, headers: customHeaders, ...opts } = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers = {
    Accept: 'application/json',
    ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const config = {
    method,
    headers,
    credentials: 'include',
    ...opts,
  };

  if (body !== undefined) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, config);

  if (res.status === 204) {
    return null;
  }

  let data = null;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed with status ${res.status}`);
  }

  return data;
}

const api = {
  get: (path, opts) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),
  del: (path, opts) => request(path, { method: 'DELETE', ...opts }),
};

export default api;
