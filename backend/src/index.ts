import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";
import profileRoutes from "./routes/profile.routes";
import notificationRoutes from "./routes/notification.routes";
import Logger from "./utils/logger";
import "dotenv/config";
import { authController } from "./controllers/AuthController";
import {
  logEventsMiddleware,
  logAuthEvents,
} from "./middlewares/logEvents.middleware";
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Configurar CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(helmet());
app.use(
  morgan("combined", {
    stream: { write: (message: string) => Logger.http(message.trim()) },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging de eventos
app.use(logAuthEvents);
app.use(logEventsMiddleware);

// Middleware para log de requisições
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Logger.info(`${req.method} ${req.url}`);
    next();
  }
);

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/health", (req: express.Request, res: express.Response) =>
  res.json({ status: "OK", timestamp: new Date().toISOString() })
);

// Criar usuários demo na inicialização
app.get(
  "/api/init-demo",
  async (req: express.Request, res: express.Response) => {
    try {
      await authController.createDemoUsers();
      await generateDemoEvents();
      res.json({
        success: true,
        message: "Usuários demo e eventos criados/verificados",
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, error: "Erro ao criar usuários demo" });
    }
  }
);

// Rota de dashboard (mantida para compatibilidade)
app.get("/api/dashboard", (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: "Dashboard acessado",
    timestamp: new Date().toISOString(),
  });
});

// Rota não encontrada
app.use("*", (req: express.Request, res: express.Response) =>
  res.status(404).json({ message: "Route not found" })
);

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    Logger.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

// FUNÇÃO PARA GERAR EVENTOS DEMO
const generateDemoEvents = async () => {
  try {
    console.log(" Gerando eventos demo automáticos...");

    // Buscar usuário demo (apenas ID)
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@eventflow.com" },
      select: { id: true },
    });

    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@eventflow.com" },
      select: { id: true },
    });

    if (demoUser) {
      // Verificar se já existem eventos para este usuário
      const existingEvents = await prisma.event.count({
        where: { userId: demoUser.id },
      });

      if (existingEvents === 0) {
        console.log(" Criando eventos demo para usuário demo...");

        // Criar eventos demo para usuário demo
        const demoEvents = [
          {
            type: "USER_REGISTERED",
            message: "Conta de demonstração criada com sucesso",
            userId: demoUser.id,
            ip: "192.168.1.100",
            userAgent: "Chrome/Windows",
            metadata: { source: "demo_generator" },
          },
          {
            type: "LOGIN_SUCCESS",
            message: "Login realizado com sucesso",
            userId: demoUser.id,
            ip: "192.168.1.100",
            userAgent: "Chrome/Windows",
            metadata: { device: "Desktop", browser: "Chrome" },
          },
          {
            type: "LOGIN_SUCCESS",
            message: "Login realizado com sucesso",
            userId: demoUser.id,
            ip: "192.168.1.101",
            userAgent: "Firefox/MacOS",
            metadata: { device: "MacBook", browser: "Firefox" },
          },
          {
            type: "ACCESS_DASHBOARD",
            message: "Usuário acessou o dashboard pela primeira vez",
            userId: demoUser.id,
            ip: "192.168.1.100",
            userAgent: "Chrome/Windows",
            metadata: { page: "dashboard", action: "view" },
          },
          {
            type: "ACCESS_DASHBOARD",
            message: "Usuário acessou o dashboard novamente",
            userId: demoUser.id,
            ip: "192.168.1.101",
            userAgent: "Firefox/MacOS",
            metadata: { page: "dashboard", action: "refresh" },
          },
          {
            type: "PROFILE_ACCESS",
            message: "Usuário visualizou página de perfil",
            userId: demoUser.id,
            ip: "192.168.1.100",
            userAgent: "Chrome/Windows",
            metadata: { section: "profile" },
          },
          {
            type: "LOGIN_FAILED",
            message: "Tentativa de login falhou - senha incorreta",
            userId: demoUser.id,
            ip: "192.168.1.102",
            userAgent: "Safari/iOS",
            metadata: { reason: "wrong_password", attempts: 1 },
          },
          {
            type: "NOTIFICATIONS_ACCESS",
            message: "Usuário acessou notificações",
            userId: demoUser.id,
            ip: "192.168.1.100",
            userAgent: "Chrome/Windows",
            metadata: { count: 5 },
          },
          {
            type: "LOGOUT",
            message: "Usuário realizou logout",
            userId: demoUser.id,
            ip: "192.168.1.100",
            userAgent: "Chrome/Windows",
            metadata: { session_duration: "2h 30m" },
          },
          {
            type: "LOGIN_SUCCESS",
            message: "Login realizado com sucesso após logout",
            userId: demoUser.id,
            ip: "192.168.1.103",
            userAgent: "Edge/Windows",
            metadata: { device: "Desktop", browser: "Edge" },
          },
        ];

        await prisma.event.createMany({
          data: demoEvents,
        });

        console.log(
          ` ${demoEvents.length} eventos demo criados para usuário demo!`
        );
      } else {
        console.log(` Usuário demo já possui ${existingEvents} eventos`);
      }
    }

    if (adminUser) {
      // Verificar se já existem eventos para admin
      const existingAdminEvents = await prisma.event.count({
        where: { userId: adminUser.id },
      });

      if (existingAdminEvents === 0) {
        console.log(" Criando eventos demo para administrador...");

        // Criar eventos demo para admin
        const adminEvents = [
          {
            type: "USER_REGISTERED",
            message: "Conta de administrador criada",
            userId: adminUser.id,
            ip: "192.168.1.1",
            userAgent: "System",
            metadata: { role: "admin" },
          },
          {
            type: "LOGIN_SUCCESS",
            message: "Administrador logou no sistema",
            userId: adminUser.id,
            ip: "192.168.1.1",
            userAgent: "Chrome/Windows",
            metadata: { role: "admin", access_level: "full" },
          },
          {
            type: "ACCESS_DASHBOARD",
            message: "Administrador acessou painel de controle",
            userId: adminUser.id,
            ip: "192.168.1.1",
            userAgent: "Chrome/Windows",
            metadata: { admin_panel: true },
          },
          {
            type: "SYSTEM_EVENT",
            message: "Sistema iniciado com sucesso",
            userId: adminUser.id,
            ip: "127.0.0.1",
            userAgent: "System",
            metadata: { event: "system_start", version: "1.0.0" },
          },
        ];

        await prisma.event.createMany({
          data: adminEvents,
        });

        console.log(
          ` ${adminEvents.length} eventos demo criados para administrador!`
        );
      } else {
        console.log(` Admin já possui ${existingAdminEvents} eventos`);
      }
    }

    // Criar notificações demo
    const allUsers = await prisma.user.findMany();
    for (const user of allUsers) {
      const existingNotifications = await prisma.notification.count({
        where: { userId: user.id },
      });

      if (existingNotifications === 0) {
        const notifications = [
          {
            title: " Bem-vindo ao EventFlow!",
            message:
              "Sua conta foi criada com sucesso. Comece explorando o dashboard.",
            type: "SUCCESS",
            userId: user.id,
            metadata: { welcome: true },
          },
          {
            title: " Login detectado",
            message: "Um novo login foi realizado na sua conta.",
            type: "INFO",
            userId: user.id,
            metadata: { ip: "192.168.1.100" },
          },
          {
            title: " Dashboard disponível",
            message: "Seu dashboard está pronto com dados de demonstração.",
            type: "SUCCESS",
            userId: user.id,
            read: true,
          },
        ];

        await prisma.notification.createMany({
          data: notifications,
        });

        console.log(` Notificações demo criadas para ${user.email}`);
      }
    }
  } catch (error: any) {
    console.error(" Erro ao gerar eventos demo:", error);
  }
};

// INICIAR SERVIDOR
app.listen(PORT, async () => {
  Logger.info(` Server running on port ${PORT}`);
  Logger.info(` CORS enabled for all origins`);
  Logger.info(` Health check: http://localhost:${PORT}/health`);
  Logger.info(` API Base URL: http://localhost:${PORT}/api`);
  Logger.info(` Frontend URL: http://localhost:5173`);

  // Criar usuários demo automaticamente
  try {
    await authController.createDemoUsers();
    await generateDemoEvents();
    Logger.info(" Usuários demo e eventos criados automaticamente");
    Logger.info(" Demo user: demo@eventflow.com / demo123");
    Logger.info(" Admin user: admin@eventflow.com / admin123");
    Logger.info(
      " Para forçar recriação: GET http://localhost:5000/api/init-demo"
    );
  } catch (error: any) {
    Logger.error(" Erro ao criar dados demo:", error.message);
  }
});
