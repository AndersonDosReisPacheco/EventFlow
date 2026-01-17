import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { notificationController } from "./NotificationController";
import { eventService } from "../services/EventService";

// Schemas de validação
const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  socialName: z
    .string()
    .max(100, "Nome social muito longo")
    .optional()
    .nullable(),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const authController = {
  // ============ REGISTRAR USUÁRIO ============
  async register(req: Request, res: Response) {
    try {
      console.log(" [REGISTER] Iniciando registro");

      // Validar dados de entrada
      const validatedData = registerSchema.parse(req.body);

      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Email já está em uso. Por favor, use outro email.",
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Criar URL da foto de perfil
      const profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(validatedData.name)}&background=random&color=fff&size=128`;

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name: validatedData.name,
          socialName: validatedData.socialName || null,
          email: validatedData.email,
          password: hashedPassword,
          profilePicture: profilePicture,
          bio: null,
          credentials: {},
        },
        select: {
          id: true,
          email: true,
          name: true,
          socialName: true,
          profilePicture: true,
          bio: true,
          credentials: true,
          createdAt: true,
        },
      });

      // Gerar token JWT
      const secret =
        process.env.JWT_SECRET ||
        "eventflow_secret_key_development_2024_changeme_for_production";

      const token = jwt.sign({ userId: user.id }, secret, {
        expiresIn: "7d",
      });

      // Registrar evento de registro
      await eventService.logUserRegistration(
        user.id,
        validatedData.email,
        req.ip || "unknown",
        req.headers["user-agent"] as string
      );

      // Criar notificação de boas-vindas
      await notificationController.createNotification(user.id, {
        title: " Bem-vindo ao EventFlow!",
        message:
          "Sua conta foi criada com sucesso. Comece explorando o dashboard para ver seus eventos em tempo real.",
        type: "SUCCESS",
        metadata: {
          welcome: true,
          userId: user.id,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(" [REGISTER] Sucesso - Usuário criado:", user.email);

      // Retornar resposta de sucesso
      return res.status(201).json({
        success: true,
        message: "Conta criada com sucesso!",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          socialName: user.socialName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          credentials: user.credentials,
          createdAt: user.createdAt,
        },
        token: token,
      });
    } catch (error: any) {
      console.error(" [REGISTER] Erro:", error);

      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: {
            field: firstError.path[0],
            message: firstError.message,
          },
        });
      }

      return res.status(500).json({
        success: false,
        error:
          "Erro interno do servidor. Por favor, tente novamente mais tarde.",
      });
    }
  },

  // ============ LOGIN DE USUÁRIO ============
  async login(req: Request, res: Response) {
    try {
      console.log(" [LOGIN] Iniciando login");

      // Validar dados de entrada
      const validatedData = loginSchema.parse(req.body);

      // Buscar usuário pelo email
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (!user) {
        // Log de tentativa de login com email inexistente
        await eventService.logLoginFailed(
          "system",
          validatedData.email,
          req.ip || "unknown",
          req.headers["user-agent"] as string
        );

        return res.status(401).json({
          success: false,
          error: "Credenciais inválidas.",
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(
        validatedData.password,
        user.password
      );

      if (!isPasswordValid) {
        // Log de tentativa de login com senha incorreta
        await eventService.logLoginFailed(
          user.id,
          validatedData.email,
          req.ip || "unknown",
          req.headers["user-agent"] as string
        );

        return res.status(401).json({
          success: false,
          error: "Credenciais inválidas.",
        });
      }

      // Gerar token JWT
      const secret =
        process.env.JWT_SECRET ||
        "eventflow_secret_key_development_2024_changeme_for_production";

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
        },
        secret,
        {
          expiresIn: "7d",
        }
      );

      // Log de login bem-sucedido
      await eventService.logLoginSuccess(
        user.id,
        req.ip || "unknown",
        req.headers["user-agent"] as string
      );

      // Criar notificação de login
      await notificationController.createNotification(user.id, {
        title: " Login detectado",
        message: `Um novo login foi realizado na sua conta. IP: ${req.ip || "Desconhecido"}`,
        type: "INFO",
        metadata: {
          ip: req.ip || "unknown",
          userAgent: req.headers["user-agent"] || "unknown",
          timestamp: new Date().toISOString(),
          location: req.ip?.includes("127.0.0.1") ? "localhost" : "remote",
        },
      });

      console.log(" [LOGIN] Sucesso para usuário:", user.email);

      // Retornar resposta de sucesso
      return res.json({
        success: true,
        message: "Login realizado com sucesso!",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          socialName: user.socialName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          credentials: user.credentials,
          createdAt: user.createdAt,
        },
        token: token,
      });
    } catch (error: any) {
      console.error(" [LOGIN] Erro:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor.",
      });
    }
  },

  // ============ LOGOUT DE USUÁRIO ============
  async logout(req: Request, res: Response) {
    try {
      console.log(" [LOGOUT] Iniciando logout");
      const authHeader = req.headers.authorization;

      if (authHeader) {
        const [, token] = authHeader.split(" ");

        if (token) {
          try {
            const secret =
              process.env.JWT_SECRET ||
              "eventflow_secret_key_development_2024_changeme_for_production";

            const decoded = jwt.verify(token, secret) as { userId: string };

            // Log de logout
            await eventService.logLogout(
              decoded.userId,
              req.ip || "unknown",
              req.headers["user-agent"] as string
            );

            // Criar notificação de logout
            await notificationController.createNotification(decoded.userId, {
              title: " Logout realizado",
              message: "Você saiu da sua conta com sucesso.",
              type: "INFO",
              metadata: {
                timestamp: new Date().toISOString(),
                ip: req.ip || "unknown",
              },
            });
          } catch (error: any) {
            // Token inválido ou expirado
            console.warn(" [LOGOUT] Token inválido ou expirado:", error);
          }
        }
      }

      return res.json({
        success: true,
        message: "Logout realizado com sucesso",
      });
    } catch (error: any) {
      console.error(" [LOGOUT] Erro:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // ============ VERIFICAR TOKEN ============
  async verifyToken(req: Request, res: Response) {
    try {
      console.log(" [VERIFY] Verificando token");
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(200).json({
          valid: false,
          error: "Token não fornecido",
          success: false,
        });
      }

      const [, token] = authHeader.split(" ");

      if (!token) {
        return res.status(200).json({
          valid: false,
          error: "Token inválido (formato incorreto)",
          success: false,
        });
      }

      const secret =
        process.env.JWT_SECRET ||
        "eventflow_secret_key_development_2024_changeme_for_production";

      const decoded = jwt.verify(token, secret) as { userId: string };

      // Buscar usuário no banco
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          socialName: true,
          profilePicture: true,
          bio: true,
          credentials: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(200).json({
          valid: false,
          error: "Usuário não encontrado",
          success: false,
        });
      }

      console.log(" [VERIFY] Token válido para usuário:", user.email);

      return res.json({
        valid: true,
        success: true,
        user: user,
        token: token,
      });
    } catch (error: any) {
      console.error(" [VERIFY] Erro na verificação do token:", error);

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(200).json({
          valid: false,
          error: "Token inválido ou malformado",
          success: false,
        });
      }

      if (error instanceof jwt.TokenExpiredError) {
        return res.status(200).json({
          valid: false,
          error: "Token expirado",
          success: false,
        });
      }

      return res.status(200).json({
        valid: false,
        error: "Erro na verificação do token",
        success: false,
      });
    }
  },

  // ============ OBTER DADOS DO USUÁRIO ATUAL ============
  async me(req: Request, res: Response) {
    try {
      console.log("👤 [ME] Obtendo dados do usuário");
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: "Token não fornecido",
        });
      }

      const [, token] = authHeader.split(" ");

      if (!token) {
        return res.status(401).json({
          success: false,
          error: "Token inválido",
        });
      }

      const secret =
        process.env.JWT_SECRET ||
        "eventflow_secret_key_development_2024_changeme_for_production";

      const decoded = jwt.verify(token, secret) as { userId: string };

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          socialName: true,
          profilePicture: true,
          bio: true,
          credentials: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado",
        });
      }

      // Log de acesso aos dados do perfil
      await eventService.createEvent({
        userId: user.id,
        type: "PROFILE_ACCESS",
        message: "Usuário acessou dados do perfil",
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] as string,
        metadata: {
          endpoint: "/api/auth/me",
          timestamp: new Date().toISOString(),
        },
      });

      return res.json({
        success: true,
        user: user,
      });
    } catch (error: any) {
      console.error(" [ME] Erro:", error);

      if (
        error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError
      ) {
        return res.status(401).json({
          success: false,
          error: "Token inválido ou expirado",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // ============ REFRESH TOKEN ============
  async refreshToken(req: Request, res: Response) {
    try {
      console.log(" [REFRESH] Solicitação de refresh token");
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: "Refresh token não fornecido",
        });
      }

      return res.status(501).json({
        success: false,
        error: "Funcionalidade não implementada",
        message: "O refresh token ainda não está disponível",
      });
    } catch (error: any) {
      console.error(" [REFRESH] Erro:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // ============ HEALTH CHECK ============
  async healthCheck(req: Request, res: Response) {
    try {
      console.log(
        " [AUTH HEALTH] Verificando saúde do serviço de autenticação"
      );

      // Verificar conexão com banco
      await prisma.$queryRaw`SELECT 1`;

      // Verificar JWT_SECRET
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.warn(
          " [AUTH HEALTH] JWT_SECRET não configurado, usando fallback"
        );
      }

      // Contar usuários
      const userCount = await prisma.user.count();

      console.log(" [AUTH HEALTH] Serviço de autenticação saudável");

      return res.json({
        success: true,
        service: "authentication",
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
        jwtConfigured: !!secret,
        userCount: userCount,
        endpoints: {
          register: "POST /api/auth/register",
          login: "POST /api/auth/login",
          logout: "POST /api/auth/logout",
          verify: "GET /api/auth/verify",
          me: "GET /api/auth/me",
        },
      });
    } catch (error: any) {
      console.error(" [AUTH HEALTH] Erro:", error);
      return res.status(503).json({
        success: false,
        service: "authentication",
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      });
    }
  },

  // ============ CRIAR USUÁRIOS DEMO ============
  async createDemoUsers() {
    try {
      console.log(" [DEMO] Verificando usuários demo...");

      // Verificar se usuário demo já existe (apenas ID)
      const demoUser = await prisma.user.findUnique({
        where: { email: "demo@eventflow.com" },
        select: { id: true },
      });

      if (!demoUser) {
        console.log(" [DEMO] Criando usuário demo...");
        const demoPassword = await bcrypt.hash("demo123", 10);

        await prisma.user.create({
          data: {
            name: "Usuário Demo",
            email: "demo@eventflow.com",
            password: demoPassword,
            socialName: "Demo User",
            profilePicture:
              "https://ui-avatars.com/api/?name=Demo+User&background=random",
            bio: "Usuário de demonstração do EventFlow",
            credentials: {},
          },
        });
        console.log(" [DEMO] Usuário demo criado!");
      } else {
        console.log(" [DEMO] Usuário demo já existe");
      }

      // Verificar se usuário admin já existe (apenas ID)
      const adminUser = await prisma.user.findUnique({
        where: { email: "admin@eventflow.com" },
        select: { id: true },
      });

      if (!adminUser) {
        console.log(" [DEMO] Criando usuário admin...");
        const adminPassword = await bcrypt.hash("admin123", 10);

        await prisma.user.create({
          data: {
            name: "Administrador EventFlow",
            email: "admin@eventflow.com",
            password: adminPassword,
            profilePicture:
              "https://ui-avatars.com/api/?name=Admin+EventFlow&background=random",
            bio: "Administrador do sistema EventFlow",
            credentials: {},
          },
        });
        console.log(" [DEMO] Usuário admin criado!");
      } else {
        console.log(" [DEMO] Usuário admin já existe");
      }
    } catch (error: any) {
      console.error(" [DEMO] Erro ao criar usuários demo:", error);
    }
  },
};
