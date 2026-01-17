import { prisma } from "../lib/prisma";

export class EventService {
  // Método principal com objeto
  async createEvent(data: {
    type: string;
    message: string;
    userId: string;
    ip?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    try {
      const event = await prisma.event.create({
        data: {
          type: data.type,
          message: data.message,
          userId: data.userId,
          ip: data.ip || "unknown",
          userAgent: data.userAgent || "unknown",
          metadata: data.metadata || {},
        },
      });
      return event;
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      throw error;
    }
  }

  // Método compatível com parâmetros separados
  async createEventParams(
    userId: string,
    type: string,
    message: string,
    ip?: string,
    userAgent?: string,
    metadata?: any
  ) {
    return this.createEvent({
      userId,
      type,
      message,
      ip,
      userAgent,
      metadata,
    });
  }

  // Métodos específicos
  async logLoginSuccess(userId: string, ip?: string, userAgent?: string) {
    return this.createEvent({
      userId,
      type: "LOGIN_SUCCESS",
      message: "Login realizado com sucesso",
      ip,
      userAgent,
    });
  }

  async logLoginFailed(
    userId: string,
    email: string,
    ip?: string,
    userAgent?: string
  ) {
    return this.createEvent({
      userId: userId === "system" ? "system" : userId,
      type: "LOGIN_FAILED",
      message: `Tentativa de login falhou para ${email}`,
      ip,
      userAgent,
      metadata: { email },
    });
  }

  async logUserRegistration(
    userId: string,
    email: string,
    ip?: string,
    userAgent?: string
  ) {
    return this.createEvent({
      userId,
      type: "USER_REGISTERED",
      message: `Novo usuário registrado: ${email}`,
      ip,
      userAgent,
      metadata: { email },
    });
  }

  async logLogout(userId: string, ip?: string, userAgent?: string) {
    return this.createEvent({
      userId,
      type: "LOGOUT",
      message: "Usuário realizou logout",
      ip,
      userAgent,
    });
  }

  async logDashboardAccess(userId: string, ip?: string, userAgent?: string) {
    return this.createEvent({
      userId,
      type: "DASHBOARD_ACCESS",
      message: "Usuário acessou dashboard",
      ip,
      userAgent,
    });
  }

  async logNotificationCreated(
    userId: string,
    notificationId: string,
    title: string
  ) {
    return this.createEvent({
      userId,
      type: "NOTIFICATION_CREATED",
      message: `Nova notificação: ${title}`,
      metadata: { notificationId, title },
    });
  }

  async logError(
    userId: string,
    type: string,
    message: string,
    ip?: string,
    userAgent?: string
  ) {
    return this.createEvent({
      userId,
      type: `ERROR_${type}`,
      message,
      ip,
      userAgent,
    });
  }
}

// Exporte uma instância para uso direto
export const eventService = new EventService();
