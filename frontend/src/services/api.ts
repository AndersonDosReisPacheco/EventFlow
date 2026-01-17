import axios from 'axios';

// ✅ CORREÇÃO: URL sem "/api" no final (as rotas já incluem "/api")
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ✅ CORREÇÃO: Criar instância ÚNICA do axios
const api = axios.create({
  baseURL: API_URL, // ✅ SEM "/api" no final
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // ✅ Adicionei timeout para evitar espera infinita
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
    console.error('Erro na requisição API:', error.response?.status, error.config?.url);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // ✅ Redireciona apenas se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 404) {
      console.error(`Endpoint não encontrado: ${error.config?.url}`);
      console.error('Verifique se a URL está correta e se o backend está rodando');
    }

    return Promise.reject(error);
  }
);

// ✅ FUNÇÕES DE AUTENTICAÇÃO (CRÍTICAS PARA LOGIN)
export const auth = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }), // ✅ COM "/api/"

  register: (data: any) =>
    api.post('/api/auth/register', data), // ✅ COM "/api/"

  logout: () =>
    api.post('/api/auth/logout'), // ✅ COM "/api/"

  me: () =>
    api.get('/api/auth/me'), // ✅ COM "/api/"

  verifyToken: (token: string) =>
    api.get('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    }), // ✅ COM "/api/"

  healthCheck: () =>
    api.get('/api/auth/health'), // ✅ COM "/api/"
};

// ✅ FUNÇÕES DE EVENTOS
export const events = {
  getEvents: (params?: any) =>
    api.get('/api/events', { params }), // ✅ COM "/api/"

  getEventStats: () =>
    api.get('/api/events/stats'), // ✅ COM "/api/"

  getEventsChartData: (days: number = 7) =>
    api.get('/api/events/chart', { params: { days } }), // ✅ COM "/api/"

  getEventTypes: () =>
    api.get('/api/events/types'), // ✅ COM "/api/"

  getRecentEvents: (limit: number = 10) =>
    api.get('/api/events/recent', { params: { limit } }), // ✅ COM "/api/"

  getEventDetails: (id: string) =>
    api.get(`/api/events/${id}`), // ✅ COM "/api/"

  logDashboardAccess: () =>
    api.post('/api/events/dashboard-access'), // ✅ COM "/api/"
};

// ✅ FUNÇÕES DE NOTIFICAÇÕES
export const notifications = {
  getNotifications: (params?: any) =>
    api.get('/api/notifications', { params }), // ✅ COM "/api/"

  getNotificationStats: () =>
    api.get('/api/notifications/stats'), // ✅ COM "/api/"

  getUnreadCount: () =>
    api.get('/api/notifications/unread-count'), // ✅ COM "/api/"

  createNotification: (data: any) =>
    api.post('/api/notifications', data), // ✅ COM "/api/"

  updateNotification: (id: string, data: any) =>
    api.put(`/api/notifications/${id}`, data), // ✅ COM "/api/"

  markAllAsRead: () =>
    api.put('/api/notifications/mark-all-read'), // ✅ COM "/api/"

  deleteNotification: (id: string) =>
    api.delete(`/api/notifications/${id}`), // ✅ COM "/api/"

  deleteAllNotifications: (readOnly: boolean = false) =>
    api.delete('/api/notifications', { params: { readOnly } }), // ✅ COM "/api/"
};

// ✅ FUNÇÕES DE PERFIL
export const profile = {
  getProfile: () =>
    api.get('/api/profile'), // ✅ COM "/api/"

  updateProfile: (data: any) =>
    api.put('/api/profile', data), // ✅ COM "/api/"

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/api/profile/password', { currentPassword, newPassword }), // ✅ COM "/api/"

  uploadProfilePicture: (imageUrl: string) =>
    api.post('/api/profile/upload-picture', { profilePicture: imageUrl }), // ✅ CORRIGIDO: POST em vez de PUT

  deleteAccount: (password: string) =>
    api.delete('/api/profile', { data: { password } }), // ✅ COM "/api/"
};

// ✅ EXPORTAÇÃO PADRÃO PARA COMPATIBILIDADE
export default api;
