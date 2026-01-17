import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// CORREÇÃO: Criar instância do axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funções auxiliares para os diferentes endpoints
export const auth = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (data: any) =>
    api.post('/api/auth/register', data),
  logout: () =>
    api.post('/api/auth/logout'),
  me: () =>
    api.get('/api/auth/me'),
  verifyToken: (token: string) =>
    api.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  healthCheck: () =>
    api.get('/api/auth/health'),
};

export const events = {
  getEvents: (params?: any) =>
    api.get('/api/events', { params }),
  getEventStats: () =>
    api.get('/api/events/stats'),
  getEventsChartData: (days: number = 7) =>
    api.get('/api/events/chart', { params: { days } }),
  getEventTypes: () =>
    api.get('/api/events/types'),
  getRecentEvents: (limit: number = 10) =>
    api.get('/api/events/recent', { params: { limit } }),
  getEventDetails: (id: string) =>
    api.get(`/api/events/${id}`),
  logDashboardAccess: () =>
    api.post('/api/events/dashboard-access'),
};

export const notifications = {
  getNotifications: (params?: any) =>
    api.get('/api/notifications', { params }),
  getNotificationStats: () =>
    api.get('/api/notifications/stats'),
  getUnreadCount: () =>
    api.get('/api/notifications/unread-count'),
  createNotification: (data: any) =>
    api.post('/api/notifications', data),
  updateNotification: (id: string, data: any) =>
    api.put(`/api/notifications/${id}`, data),
  markAllAsRead: () =>
    api.put('/api/notifications/mark-all-read'),
  deleteNotification: (id: string) =>
    api.delete(`/api/notifications/${id}`),
  deleteAllNotifications: (readOnly: boolean = false) =>
    api.delete('/api/notifications', { params: { readOnly } }),
};

export const profile = {
  getProfile: () =>
    api.get('/api/profile'),
  updateProfile: (data: any) =>
    api.put('/api/profile', data),
  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/api/profile/password', { currentPassword, newPassword }),
  updateCredentials: (credentials: any) =>
    api.put('/api/profile/credentials', { credentials }),
  uploadProfilePicture: (imageUrl: string) =>
    api.put('/api/profile/profile-picture', { imageUrl }),
  deleteAccount: (password: string) =>
    api.delete('/api/profile', { data: { password } }),
};

// Exportação padrão para compatibilidade
export default api;
