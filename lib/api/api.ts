import axios from 'axios';
import { useAuthStore } from '../stores/store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://acompanhar-production.up.railway.app',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar múltiplos refreshes simultâneos
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  // Tenta pegar o token do store primeiro, se não do localStorage
  const token = useAuthStore.getState().token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de resposta (especialmente 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de login ou refresh
    if (
      error.response?.status === 401 && 
      originalRequest &&
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/login') && 
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        // Chamada direta ao axios para o refresh para evitar interceptores
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, {
          refreshToken,
        });

        const newToken = data.token;
        useAuthStore.getState().setToken(newToken);
        
        processQueue(null, newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
