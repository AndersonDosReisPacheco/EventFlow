import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { z } from "zod";
import { EventService } from "../services/EventService";

const eventService = new EventService();

const eventFiltersSchema = z.object({
  type: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

async function createEvent(
  userId: string,
  type: string,
  message: string,
  ip?: string,
  userAgent?: string,
  metadata?: any
) {
  try {
    const event = await prisma.event.create({
      data: {
        type,
        message,
        userId,
        ip: ip || "127.0.0.1",
        userAgent: userAgent || "Unknown",
        metadata: metadata || {},
      },
    });
    return event;
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw error;
  }
}

export const eventController = {
  //  DADOS REAIS DO DASHBOARD - COM ISOLAMENTO VERIFICADO
  async getEventStats(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      //  TODAS AS QUERIES COM FILTRO userId - ISOLAMENTO GARANTIDO
      const [
        totalEvents,
        todayEvents,
        last7DaysEvents,
        last30DaysEvents,
        loginEvents,
        dashboardEvents,
      ] = await Promise.all([
        prisma.event.count({
          where: { userId: req.userId }, //  ISOLAMENTO
        }),
        prisma.event.count({
          where: {
            userId: req.userId, //  ISOLAMENTO
            createdAt: { gte: today },
          },
        }),
        prisma.event.count({
          where: {
            userId: req.userId, //  ISOLAMENTO
            createdAt: { gte: sevenDaysAgo },
          },
        }),
        prisma.event.count({
          where: {
            userId: req.userId, //  ISOLAMENTO
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
        prisma.event.count({
          where: {
            userId: req.userId, //  ISOLAMENTO
            OR: [{ type: "LOGIN_SUCCESS" }, { type: "AUTH_LOGIN_SUCCESS" }],
          },
        }),
        prisma.event.count({
          where: {
            userId: req.userId, //  ISOLAMENTO
            OR: [{ type: "DASHBOARD_ACCESS" }, { type: "ACCESS_DASHBOARD" }],
          },
        }),
      ]);

      return res.json({
        success: true,
        totalEvents,
        todayEvents,
        last7DaysEvents,
        last30DaysEvents,
        loginEvents,
        dashboardEvents,
        eventsPerDay: {
          last7DaysAvg: (last7DaysEvents / 7).toFixed(1),
          last30DaysAvg: (last30DaysEvents / 30).toFixed(1),
        },
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  //  GRÁFICO COM DADOS REAIS - COM ISOLAMENTO VERIFICADO
  async getEventsChartData(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const days = req.query.days as string;
      const daysCount = days ? parseInt(days) : 7;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysCount);
      startDate.setHours(0, 0, 0, 0);

      //  Buscar eventos APENAS do usuário autenticado
      const events = await prisma.event.findMany({
        where: {
          userId: req.userId, //  ISOLAMENTO
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          type: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Processar dados para o gráfico
      const chartData = Array.from({ length: daysCount }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (daysCount - i - 1));
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split("T")[0];

        // Filtrar eventos deste dia
        const dayEvents = events.filter((event) => {
          const eventDate = new Date(event.createdAt);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.toISOString().split("T")[0] === dateStr;
        });

        // Agrupar por tipo
        const byType: Record<string, number> = {};
        dayEvents.forEach((event) => {
          byType[event.type] = (byType[event.type] || 0) + 1;
        });

        return {
          date: dateStr,
          total: dayEvents.length,
          byType,
        };
      });

      return res.json({
        success: true,
        chartData,
      });
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  //  LISTA DE EVENTOS COM FILTROS - COM ISOLAMENTO VERIFICADO
  async getEvents(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const filters = eventFiltersSchema.parse(req.query);

      const where: any = {
        userId: req.userId, //  ISOLAMENTO: Filtro OBRIGATÓRIO
      };

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdAt.lte = new Date(filters.endDate);
        }
      }

      if (filters.search) {
        where.OR = [
          {
            message: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            type: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        ];
      }

      const skip = (filters.page - 1) * filters.limit;

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: filters.limit,
          select: {
            id: true,
            type: true,
            message: true,
            createdAt: true,
            ip: true,
            userAgent: true,
            metadata: true,
          },
        }),
        prisma.event.count({ where }),
      ]);

      return res.json({
        success: true,
        events,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit),
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Filtros inválidos",
          details: error.errors,
        });
      }

      console.error("Erro ao buscar eventos:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  //  DETALHES DO EVENTO - COM VERIFICAÇÃO DUPLA DE ISOLAMENTO
  async getEventDetails(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const { id } = req.params;

      //  VERIFICAÇÃO CRÍTICA: Garante que o evento pertence ao usuário
      const event = await prisma.event.findFirst({
        where: {
          id,
          userId: req.userId, //  ISOLAMENTO: Filtro OBRIGATÓRIO
        },
        select: {
          id: true,
          type: true,
          message: true,
          createdAt: true,
          ip: true,
          userAgent: true,
          metadata: true,
        },
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          error:
            "Evento não encontrado ou você não tem permissão para acessá-lo",
        });
      }

      return res.json({
        success: true,
        event,
      });
    } catch (error) {
      console.error("Erro ao buscar detalhes do evento:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  //  LOG DE ACESSO AO DASHBOARD - COM ISOLAMENTO
  async logDashboardAccess(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      await createEvent(
        req.userId,
        "ACCESS_DASHBOARD",
        "Usuário acessou o dashboard",
        req.ip,
        req.headers["user-agent"] as string,
        {
          endpoint: req.url,
          method: req.method,
          timestamp: new Date().toISOString(),
        }
      );

      return res.json({
        success: true,
        message: "Acesso ao dashboard registrado",
      });
    } catch (error) {
      console.error("Erro ao registrar acesso ao dashboard:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  //  TIPOS DE EVENTOS DISPONÍVEIS - COM ISOLAMENTO
  async getEventTypes(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const eventTypes = await prisma.event.groupBy({
        by: ["type"],
        where: { userId: req.userId }, //  ISOLAMENTO
        _count: true,
        orderBy: {
          _count: {
            type: "desc",
          },
        },
      });

      return res.json({
        success: true,
        eventTypes: eventTypes.map((et) => ({
          type: et.type,
          count: et._count,
        })),
      });
    } catch (error) {
      console.error("Erro ao buscar tipos de eventos:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  //  EVENTOS RECENTES - COM ISOLAMENTO
  async getRecentEvents(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const limit = req.query.limit as string;
      const limitNum = limit ? parseInt(limit) : 10;

      const events = await prisma.event.findMany({
        where: { userId: req.userId }, //  ISOLAMENTO
        orderBy: { createdAt: "desc" },
        take: limitNum,
        select: {
          id: true,
          type: true,
          message: true,
          createdAt: true,
          metadata: true,
        },
      });

      return res.json({
        success: true,
        events,
      });
    } catch (error) {
      console.error("Erro ao buscar eventos recentes:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },
};
