import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const eventsApi = {
  // 🔥 DADOS REAIS DO DASHBOARD
  async getStats() {
    try {
      const response = await api.get("/events/stats");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      throw error;
    }
  },

  // 🔥 GRÁFICOS COM DADOS REAIS
  async getChartData(days: number = 7) {
    try {
      const response = await api.get(`/events/chart?days=${days}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico:", error);
      throw error;
    }
  },

  // 🔥 EVENTOS COM FILTROS
  async getEvents(filters: any = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.pageSize) params.append("limit", filters.pageSize.toString());
      if (filters.type) params.append("type", filters.type);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.search) params.append("search", filters.search);

      const response = await api.get(`/events?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      throw error;
    }
  },

  // 🔥 TIPOS DE EVENTOS DISPONÍVEIS
  async getEventTypes() {
    try {
      const response = await api.get("/events/types");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar tipos de eventos:", error);
      throw error;
    }
  },

  // 🔥 EVENTOS RECENTES
  async getRecentEvents(limit: number = 10) {
    try {
      const response = await api.get(`/events/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar eventos recentes:", error);
      throw error;
    }
  },

  // 🔥 DETALHES DO EVENTO
  async getEventDetails(id: string) {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar detalhes do evento:", error);
      throw error;
    }
  },

  // 🔥 LOG DE ACESSO AO DASHBOARD
  async logDashboardAccess() {
    try {
      const response = await api.post("/events/dashboard-access");
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar acesso ao dashboard:", error);
      throw error;
    }
  },
};

export const notificationsApi = {
  // 🔥 NOTIFICAÇÕES REAIS
  async getNotifications(filters: any = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.unreadOnly) params.append("unreadOnly", filters.unreadOnly);
      if (filters.type) params.append("type", filters.type);

      const response = await api.get(`/notifications?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      throw error;
    }
  },

  // 🔥 ESTATÍSTICAS DE NOTIFICAÇÕES
  async getNotificationStats() {
    try {
      const response = await api.get("/notifications/stats");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar estatísticas de notificações:", error);
      throw error;
    }
  },

  // 🔥 CONTADOR DE NÃO LIDAS
  async getUnreadCount() {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar contador de não lidas:", error);
      throw error;
    }
  },

  // 🔥 MARCAR COMO LIDA
  async markAsRead(id: string) {
    try {
      const response = await api.put(`/notifications/${id}`, { read: true });
      return response.data;
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
      throw error;
    }
  },

  // 🔥 MARCAR TODAS COMO LIDAS
  async markAllAsRead() {
    try {
      const response = await api.put("/notifications/mark-all-read");
      return response.data;
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
      throw error;
    }
  },
};

export const profileApi = {
  // 🔥 DADOS REAIS DO PERFIL
  async getProfile() {
    try {
      const response = await api.get("/profile");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      throw error;
    }
  },

  // 🔥 ATUALIZAR PERFIL
  async updateProfile(data: any) {
    try {
      const response = await api.put("/profile", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }
  },

  // 🔥 ALTERAR SENHA
  async updatePassword(data: any) {
    try {
      const response = await api.put("/profile/password", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      throw error;
    }
  },
};

export default api;
