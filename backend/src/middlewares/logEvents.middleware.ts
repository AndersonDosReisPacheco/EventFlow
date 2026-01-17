import { Request, Response, NextFunction } from "express";
import { eventService } from "../services/EventService";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const logEventsMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Registrar eventos específicos
    if (req.userId) {
      // Registrar acesso ao dashboard
      if (req.path.includes("/api/events") && req.method === "GET") {
        await eventService.logDashboardAccess(
          req.userId,
          req.ip,
          req.headers["user-agent"] as string
        );
      }

      // Registrar acesso ao perfil
      if (req.path.includes("/api/profile") && req.method === "GET") {
        await eventService.createEvent(
          req.userId,
          "PROFILE_ACCESS",
          "Usuário acessou perfil",
          req.ip,
          req.headers["user-agent"] as string
        );
      }

      // Registrar acesso a notificações
      if (req.path.includes("/api/notifications") && req.method === "GET") {
        await eventService.createEvent(
          req.userId,
          "NOTIFICATIONS_ACCESS",
          "Usuário acessou notificações",
          req.ip,
          req.headers["user-agent"] as string
        );
      }
    }

    // Capturar respostas de erro
    const originalSend = res.send;
    res.send = function (body) {
      try {
        // Verificar se é uma resposta de erro
        if (res.statusCode >= 400) {
          let parsedBody;
          try {
            parsedBody = JSON.parse(body);
          } catch {
            parsedBody = body;
          }

          if (req.userId) {
            eventService
              .logError(
                req.userId,
                `HTTP_${res.statusCode}`,
                typeof parsedBody === "object"
                  ? parsedBody.error || "Erro não especificado"
                  : "Erro na requisição",
                req.ip,
                req.headers["user-agent"] as string
              )
              .catch(console.error);
          }
        }
      } catch (error) {
        console.error("Erro ao processar resposta:", error);
      }

      return originalSend.call(this, body);
    };

    next();
  } catch (error) {
    console.error("Erro no middleware de eventos:", error);
    next();
  }
};

// Middleware específico para autenticação
export const logAuthEvents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json;
  res.json = function (body) {
    try {
      // Registrar login bem-sucedido
      if (
        req.path === "/api/auth/login" &&
        req.method === "POST" &&
        res.statusCode === 200
      ) {
        if (body && body.user && body.user.id) {
          eventService
            .logLoginSuccess(
              body.user.id,
              req.ip,
              req.headers["user-agent"] as string
            )
            .catch(console.error);
        }
      }

      // Registrar novo usuário
      if (
        req.path === "/api/auth/register" &&
        req.method === "POST" &&
        res.statusCode === 201
      ) {
        if (body && body.user && body.user.id) {
          eventService
            .logUserRegistration(
              body.user.id,
              body.user.email,
              req.ip,
              req.headers["user-agent"] as string
            )
            .catch(console.error);
        }
      }
    } catch (error) {
      console.error("Erro ao registrar evento de autenticação:", error);
    }

    return originalJson.call(this, body);
  };

  next();
};
