import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Request Interceptor: attach JWT ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gamerhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gamerhub_token');
      localStorage.removeItem('gamerhub_user');
      // Redirect to login only if not already there
      const currentPath = `${window.location.pathname}${window.location.hash || ''}`;
      if (!currentPath.includes('/login')) {
        const loginPath = import.meta.env.PROD ? '/#/login' : '/login';
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
