const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
let accessToken = null;

export const setCustomerAccessToken = (token) => {
  accessToken = token || null;
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.errors = data?.errors;
    throw error;
  }
  return data;
};

const request = async (endpoint, options = {}, canRefresh = true) => {
  const token = accessToken;
  const headers = { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers, credentials: 'include' });
  if (response.status === 401 && token && canRefresh && !endpoint.startsWith('/auth/')) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refreshResponse.ok) {
      const refreshed = await refreshResponse.json();
      const nextToken = refreshed.data?.token;
      if (nextToken) {
        setCustomerAccessToken(nextToken);
        return request(endpoint, options, false);
      }
    }
    setCustomerAccessToken(null);
  }
  return parseResponse(response);
};

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
  put: (endpoint, body) => request(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
  patch: (endpoint, body) => request(endpoint, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
