import { prisma } from "../lib/prisma";

export class EventService {
  async createEvent(data: {
    type: string;
    message: string;
    userId: string;
    metadata?: any;
    ip?: string;
    userAgent?: string;
  }) {
    return prisma.event.create({
      data: {
        type: data.type,
        message: data.message,
        userId: data.userId,
        ip: data.ip || "127.0.0.1",
        userAgent: data.userAgent || "Unknown",
        metadata: data.metadata || {},
      },
    });
  }

  async logUserRegistration(
    userId: string,
    email: string,
    ip?: string,
    userAgent?: string
  ) {
    return this.createEvent({
      type: "USER_REGISTRATION",
      message: `Novo usuário registrado: ${email}`,
      userId,
      ip,
      userAgent,
    });
  }

  async logLoginSuccess(userId: string, ip?: string, userAgent?: string) {
    return this.createEvent({
      type: "LOGIN_SUCCESS",
      message: "Login realizado com sucesso",
      userId,
      ip,
      userAgent,
    });
  }

  async logLoginFailed(
    userId: string,
    email: string,
    ip?: string,
    userAgent?: string,
    reason?: string
  ) {
    return this.createEvent({
      type: "LOGIN_FAILED",
      message: `Tentativa de login falhou para ${email}${reason ? ` - ${reason}` : ""}`,
      userId: userId === "system" ? "system" : userId,
      ip,
      userAgent,
    });
  }

  async logLogout(userId: string, ip?: string, userAgent?: string) {
    return this.createEvent({
      type: "LOGOUT",
      message: "Usuário fez logout",
      userId,
      ip,
      userAgent,
    });
  }

  async logProfileUpdate(
    userId: string,
    fields?: string[],
    ip?: string,
    userAgent?: string
  ) {
    return this.createEvent({
      type: "PROFILE_UPDATE",
      message: `Perfil atualizado${fields ? ` - Campos: ${fields.join(", ")}` : ""}`,
      userId,
      ip,
      userAgent,
    });
  }

  async logPasswordChange(userId: string, ip?: string, userAgent?: string) {
    return this.createEvent({
      type: "PASSWORD_CHANGE",
      message: "Senha alterada com sucesso",
      userId,
      ip,
      userAgent,
    });
  }

  async logCredentialsUpdate(
    userId: string,
    fields?: string[],
    ip?: string,
    userAgent?: string
  ) {
    return this.createEvent({
      type: "CREDENTIALS_UPDATE",
      message: `Credenciais atualizadas${fields ? ` - Campos: ${fields.join(", ")}` : ""}`,
      userId,
      ip,
      userAgent,
    });
  }

  async logDashboardAccess(userId: string, ip?: string, userAgent?: string) {
    return this.createEvent({
      type: "DASHBOARD_ACCESS",
      message: "Acesso ao dashboard",
      userId,
      ip,
      userAgent,
    });
  }

  async logNotificationCreated(
    userId: string,
    notificationId: string,
    title?: string
  ) {
    return this.createEvent({
      type: "NOTIFICATION_CREATED",
      message: `Notificação criada: ${title || notificationId}`,
      userId,
    });
  }

  async logError(
    message: string,
    metadata?: any,
    ip?: string,
    userAgent?: string
  ) {
    return prisma.event.create({
      data: {
        type: "ERROR",
        message,
        userId: "system",
        ip: ip || "127.0.0.1",
        userAgent: userAgent || "Unknown",
        metadata: metadata || {},
      },
    });
  }
}
