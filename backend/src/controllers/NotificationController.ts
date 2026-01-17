import { Response } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { EventService } from "../services/EventService";

const eventService = new EventService();

// Schemas de validação
const createNotificationSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título muito longo"),
  message: z
    .string()
    .min(1, "Mensagem é obrigatória")
    .max(1000, "Mensagem muito longa"),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR"]),
  metadata: z.record(z.any()).optional(),
});

const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
});

const notificationFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  unreadOnly: z.enum(["true", "false"]).optional().default("false"),
  type: z.string().optional(),
});

export const notificationController = {
  // Função auxiliar para calcular tempo relativo
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 30) {
      return new Date(date).toLocaleDateString("pt-BR");
    }
    if (diffDay > 0) return `${diffDay} dia${diffDay > 1 ? "s" : ""} atrás`;
    if (diffHour > 0) return `${diffHour} hora${diffHour > 1 ? "s" : ""} atrás`;
    if (diffMin > 0) return `${diffMin} minuto${diffMin > 1 ? "s" : ""} atrás`;
    return `${diffSec} segundo${diffSec > 1 ? "s" : ""} atrás`;
  },

  // Criar notificação (função interna)
  async createNotification(
    userId: string,
    data: {
      title: string;
      message: string;
      type: string;
      metadata?: any;
    }
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          userId: userId,
          metadata: data.metadata || {},
        },
      });

      // Registrar evento de criação de notificação
      await eventService.logNotificationCreated(
        userId,
        notification.id,
        data.title
      );

      return notification;
    } catch (error: any) {
      console.error("Erro ao criar notificação:", error);
      throw error;
    }
  },

  // Listar notificações do usuário
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const filters = notificationFiltersSchema.parse(req.query);

      const pageNum = filters.page;
      const limitNum = filters.limit;
      const skip = (pageNum - 1) * limitNum;

      const where: any = {
        userId: req.userId,
      };

      if (filters.unreadOnly === "true") {
        where.read = false;
      }

      if (filters.type) {
        const typeValue =
          typeof filters.type === "string"
            ? filters.type
            : Array.isArray(filters.type)
              ? filters.type[0]
              : undefined;
        if (typeValue) {
          where.type = typeValue;
        }
      }

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limitNum,
          select: {
            id: true,
            title: true,
            message: true,
            type: true,
            read: true,
            metadata: true,
            createdAt: true,
          },
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: {
            userId: req.userId,
            read: false,
          },
        }),
      ]);

      // CORREÇÃO: Usar tipo 'any' para evitar problemas com o Prisma 7
      const unreadIds = notifications
        .filter((n: any) => !n.read)
        .map((n: any) => n.id);

      if (filters.unreadOnly !== "true" && unreadIds.length > 0) {
        await prisma.notification.updateMany({
          where: {
            id: { in: unreadIds },
            userId: req.userId,
          },
          data: { read: true },
        });

        notifications.forEach((n: any) => {
          if (!n.read) n.read = true;
        });
      }

      const formattedNotifications = notifications.map((notification: any) => ({
        ...notification,
        createdAtFormatted: new Date(notification.createdAt).toLocaleString(
          "pt-BR",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }
        ),
        timeAgo: this.getTimeAgo(notification.createdAt),
      }));

      await eventService.createEvent({
        type: "NOTIFICATIONS_ACCESS",
        message: `Acessou notificações (filtros: ${JSON.stringify(filters)})`,
        userId: req.userId,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] as string,
        metadata: {
          filters,
          results: notifications.length,
          total,
          unreadCount,
        },
      });

      return res.json({
        success: true,
        notifications: formattedNotifications,
        stats: {
          total,
          unread: unreadCount,
          read: total - unreadCount,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Filtros inválidos",
          details: error.errors.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      console.error("Erro ao buscar notificações:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // Obter estatísticas de notificações
  async getNotificationStats(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const [total, unread, read, byType] = await Promise.all([
        prisma.notification.count({
          where: { userId: req.userId },
        }),
        prisma.notification.count({
          where: {
            userId: req.userId,
            read: false,
          },
        }),
        prisma.notification.count({
          where: {
            userId: req.userId,
            read: true,
          },
        }),
        prisma.notification.groupBy({
          by: ["type"],
          where: { userId: req.userId },
          _count: true,
        }),
      ]);

      const typeStats: Record<string, number> = {};
      byType.forEach((item: any) => {
        typeStats[item.type] = item._count;
      });

      return res.json({
        success: true,
        total,
        unread,
        read,
        unreadPercentage: total > 0 ? ((unread / total) * 100).toFixed(1) : "0",
        byType: typeStats,
        last24Hours: await prisma.notification.count({
          where: {
            userId: req.userId,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
      });
    } catch (error: any) {
      console.error("Erro ao buscar estatísticas:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // Marcar notificação como lida/não lida
  async updateNotification(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const { id } = req.params;
      const notificationId = Array.isArray(id) ? id[0] : id;

      const validatedData = updateNotificationSchema.parse(req.body);

      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: req.userId,
        },
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error:
            "Notificação não encontrada ou você não tem permissão para alterá-la",
        });
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: validatedData,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          read: true,
          createdAt: true,
        },
      });

      await eventService.createEvent({
        type: "NOTIFICATION_UPDATED",
        message: `Notificação marcada como ${validatedData.read ? "lida" : "não lida"}`,
        userId: req.userId,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] as string,
        metadata: {
          notificationId: notificationId,
          read: validatedData.read,
        },
      });

      return res.json({
        success: true,
        message: "Notificação atualizada com sucesso",
        notification: updatedNotification,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: error.errors.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      console.error("Erro ao atualizar notificação:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // Marcar todas como lidas
  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const updatedCount = await prisma.notification.updateMany({
        where: {
          userId: req.userId,
          read: false,
        },
        data: { read: true },
      });

      // Registrar marcação de todas como lidas
      await eventService.createEvent({
        type: "NOTIFICATIONS_MARK_ALL_READ",
        message: "Todas as notificações marcadas como lidas",
        userId: req.userId,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] as string,
        metadata: {
          count: updatedCount.count,
        },
      });

      return res.json({
        success: true,
        message: "Todas as notificações marcadas como lidas",
        count: updatedCount.count,
      });
    } catch (error: any) {
      console.error("Erro ao marcar notificações como lidas:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // Excluir notificação
  async deleteNotification(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const { id } = req.params;
      const notificationId = Array.isArray(id) ? id[0] : id;

      // VERIFICAÇÃO DE ISOLAMENTO: Garante que a notificação pertence ao usuário
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: req.userId,
        },
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error:
            "Notificação não encontrada ou você não tem permissão para excluí-la",
        });
      }

      await prisma.notification.delete({
        where: { id: notificationId },
      });

      // Registrar exclusão
      await eventService.createEvent({
        type: "NOTIFICATION_DELETED",
        message: "Notificação excluída",
        userId: req.userId,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] as string,
        metadata: {
          notificationId: notificationId,
          title: notification.title,
        },
      });

      return res.json({
        success: true,
        message: "Notificação excluída com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao excluir notificação:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // Excluir todas as notificações
  async deleteAllNotifications(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const readOnly = req.query.readOnly;
      const readOnlyValue =
        typeof readOnly === "string"
          ? readOnly
          : Array.isArray(readOnly)
            ? readOnly[0]
            : "false";

      const where: any = {
        userId: req.userId,
      };

      if (readOnlyValue === "true") {
        where.read = true;
      }

      const deletedCount = await prisma.notification.deleteMany({
        where,
      });

      // Registrar exclusão em massa
      await eventService.createEvent({
        type: "NOTIFICATIONS_DELETE_ALL",
        message: `Todas as notificações ${readOnlyValue === "true" ? "lidas" : ""} excluídas`,
        userId: req.userId,
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] as string,
        metadata: {
          count: deletedCount.count,
          readOnly: readOnlyValue === "true",
        },
      });

      return res.json({
        success: true,
        message: `Notificações ${readOnlyValue === "true" ? "lidas" : ""} excluídas com sucesso`,
        count: deletedCount.count,
      });
    } catch (error: any) {
      console.error("Erro ao excluir notificações:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // Criar notificação via API
  async createNotificationApi(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const validatedData = createNotificationSchema.parse(req.body);

      const notification = await this.createNotification(req.userId, {
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        metadata: validatedData.metadata,
      });

      return res.status(201).json({
        success: true,
        message: "Notificação criada com sucesso",
        notification,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
        });
      }

      console.error("Erro ao criar notificação:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // Obter notificações não lidas (para badges)
  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const count = await prisma.notification.count({
        where: {
          userId: req.userId,
          read: false,
        },
      });

      return res.json({
        success: true,
        count,
      });
    } catch (error: any) {
      console.error("Erro ao contar notificações não lidas:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },
};
