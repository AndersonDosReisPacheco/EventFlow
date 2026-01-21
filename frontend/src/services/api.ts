
import axios from 'axios';
import { toast } from 'react-hot-toast';

//  URL SILENCIOSA - Sem logs desnecessários
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

//  API SEM LOGS NO CONSOLE
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

//  Interceptor SILENCIOSO
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//  Interceptor SILENCIOSO - Sem logs de erro visíveis
api.interceptors.response.use(
  (response) => response,
  (error) => {
    //  NÃO LOGAR ERROS NO CONSOLE
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } else if (status === 500) {
      //  NÃO FAZER NADA - Erro interno do servidor é tratado silenciosamente
    } else if (error.code === 'ERR_NETWORK') {
      //  NÃO MOSTRAR ERRO DE REDE
    }

    return Promise.reject(error);
  }
);

//  API functions SILENCIOSAS
export const auth = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  register: (data: any) =>
    api.post('/api/auth/register', data),

  logout: () =>
    api.post('/api/auth/logout'),

  me: () =>
    api.get('/api/auth/me'),

  verifyToken: () =>
    api.get('/api/auth/verify'),

  healthCheck: () =>
    api.get('/api/health'),
};

export const events = {
  getEvents: (params?: any) =>
    api.get('/api/events', { params }),

  getEventStats: () =>
    api.get('/api/events/stats'),

  getRecentEvents: (limit: number = 10) =>
    api.get('/api/events/recent', { params: { limit } }),

  logDashboardAccess: () =>
    api.post('/api/events/dashboard-access'),
};

export const notifications = {
  getNotifications: (params?: any) =>
    api.get('/api/notifications', { params }),

  getUnreadCount: () =>
    api.get('/api/notifications/unread-count'),

  updateNotification: (id: string, data: any) =>
    api.put(`/api/notifications/${id}`, data),

  markAllAsRead: () =>
    api.put('/api/notifications/mark-all-read'),

  deleteNotification: (id: string) =>
    api.delete(`/api/notifications/${id}`),

  deleteAllNotifications: () =>
    api.delete('/api/notifications'),
};

export const profile = {
  getProfile: () =>
    api.get('/api/profile'),

  updateProfile: (data: any) =>
    api.put('/api/profile', data),
};

export default api;
