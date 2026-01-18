// ✅ IMPORTAR A INSTÂNCIA DO AuthContext EM VEZ DE CRIAR NOVA
import { authApi } from '../contexts/AuthContext';

// ✅ USAR A MESMA INSTÂNCIA
const api = authApi;

// ✅ FUNÇÕES DE AUTENTICAÇÃO (CRÍTICAS PARA LOGIN)
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

// ✅ FUNÇÕES DE EVENTOS
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

// ✅ FUNÇÕES DE NOTIFICAÇÕES
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

// ✅ FUNÇÕES DE PERFIL
export const profile = {
  getProfile: () =>
    api.get('/api/profile'),

  updateProfile: (data: any) =>
    api.put('/api/profile', data),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/api/profile/password', { currentPassword, newPassword }),

  uploadProfilePicture: (imageUrl: string) =>
    api.post('/api/profile/upload-picture', { profilePicture: imageUrl }),

  deleteAccount: (password: string) =>
    api.delete('/api/profile', { data: { password } }),
};

// ✅ EXPORTAÇÃO PADRÃO PARA COMPATIBILIDADE
export default api;
