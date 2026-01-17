// D:\Meu_Projetos_Pessoais\EventFlow\backend\src\controllers\ProfileController.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { notificationController } from "./NotificationController";
import { eventService } from '../services/EventService'

//  Schemas de validação - BIO LIMITADA A 100 CARACTERES
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .optional(),
  email: z.string().email("Email inválido").optional(),
  socialName: z
    .string()
    .max(100, "Nome social muito longo")
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(100, "Biografia deve ter no máximo 100 caracteres")
    .optional()
    .nullable(), //  ALTERADO: 100 caracteres
  profilePicture: z.string().url("URL da foto inválida").optional().nullable(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

const updateCredentialsSchema = z.object({
  credentials: z.record(z.any()).optional(),
});

export const profileController = {
  //  Obter perfil do usuário atual - COM ISOLAMENTO
  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId }, //  ISOLAMENTO: Busca pelo ID do usuário autenticado
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

      // Registrar evento de acesso ao perfil
      await eventService.createEvent(
        req.userId,
        "PROFILE_ACCESS",
        "Usuário acessou página de perfil",
        req.ip,
        req.headers["user-agent"] as string
      );

      return res.json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  //  Atualizar perfil - COM ISOLAMENTO
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const validatedData = updateProfileSchema.parse(req.body);

      // Verificar se email já está em uso por outro usuário
      if (validatedData.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: validatedData.email,
            id: { not: req.userId }, //  ISOLAMENTO: Exclui o próprio usuário
          },
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: "Email já está em uso por outro usuário",
          });
        }
      }

      // Buscar dados antigos para log
      const oldUser = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          name: true,
          email: true,
          socialName: true,
          bio: true,
          profilePicture: true,
        },
      });

      // Preparar dados para atualização
      const updateData: any = { ...validatedData };

      // Adicionar updatedAt manualmente
      updateData.updatedAt = new Date();

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: "Nenhum dado fornecido para atualização",
        });
      }

      //  Atualizar usuário - COM ISOLAMENTO
      const user = await prisma.user.update({
        where: { id: req.userId }, //  ISOLAMENTO: Atualiza apenas o usuário autenticado
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          socialName: true,
          profilePicture: true,
          bio: true,
          credentials: true,
          updatedAt: true,
        },
      });

      // Registrar evento de atualização
      const updatedFields = Object.keys(validatedData);
      await eventService.logProfileUpdate(
        req.userId,
        updatedFields,
        req.ip,
        req.headers["user-agent"] as string
      );

      // Criar notificação
      await notificationController.createNotification(req.userId, {
        title: " Perfil atualizado",
        message: `Seu perfil foi atualizado com sucesso. Campos modificados: ${updatedFields.join(", ")}`,
        type: "SUCCESS",
        metadata: {
          updatedFields,
          timestamp: new Date().toISOString(),
        },
      });

      return res.json({
        success: true,
        message: "Perfil atualizado com sucesso",
        user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      console.error("Erro ao atualizar perfil:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  //  Atualizar senha - COM ISOLAMENTO
  async updatePassword(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const validatedData = updatePasswordSchema.parse(req.body);

      // Buscar usuário com senha
      const user = await prisma.user.findUnique({
        where: { id: req.userId }, //  ISOLAMENTO
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado",
        });
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(
        validatedData.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        // Registrar tentativa falha
        await eventService.createEvent(
          req.userId,
          "PASSWORD_CHANGE_FAILED",
          "Tentativa de alteração de senha com senha atual incorreta",
          req.ip,
          req.headers["user-agent"] as string
        );

        return res.status(400).json({
          success: false,
          error: "Senha atual incorreta",
        });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

      //  Atualizar senha - COM ISOLAMENTO
      await prisma.user.update({
        where: { id: req.userId }, //  ISOLAMENTO
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      // Registrar alteração de senha
      await eventService.logPasswordChange(
        req.userId,
        req.ip,
        req.headers["user-agent"] as string
      );

      // Criar notificação
      await notificationController.createNotification(req.userId, {
        title: " Senha alterada",
        message:
          "Sua senha foi alterada com sucesso. Se não foi você, entre em contato com o suporte.",
        type: "WARNING",
        metadata: {
          timestamp: new Date().toISOString(),
          ip: req.ip,
        },
      });

      return res.json({
        success: true,
        message: "Senha alterada com sucesso",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      console.error("Erro ao alterar senha:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  //  Atualizar credenciais - COM ISOLAMENTO
  async updateCredentials(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const validatedData = updateCredentialsSchema.parse(req.body);

      // Buscar credenciais atuais
      const currentUser = await prisma.user.findUnique({
        where: { id: req.userId }, //  ISOLAMENTO
        select: { credentials: true },
      });

      // Preparar novas credenciais (mesclar com existentes)
      const currentCredentialsObj = currentUser?.credentials;
      const currentCredentials: Record<string, any> =
        currentCredentialsObj &&
        typeof currentCredentialsObj === "object" &&
        !Array.isArray(currentCredentialsObj)
          ? (currentCredentialsObj as Record<string, any>)
          : {};
      const newCredentials: Record<string, any> =
        validatedData.credentials || {};

      // Mesclar mantendo as existentes
      const mergedCredentials = { ...currentCredentials, ...newCredentials };

      //  Atualizar usuário - COM ISOLAMENTO
      const user = await prisma.user.update({
        where: { id: req.userId }, //  ISOLAMENTO
        data: {
          credentials: mergedCredentials,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          socialName: true,
          profilePicture: true,
          bio: true,
          credentials: true,
          updatedAt: true,
        },
      });

      // Registrar atualização de credenciais
      const updatedFields = Object.keys(newCredentials);
      await eventService.logCredentialsUpdate(
        req.userId,
        updatedFields,
        req.ip,
        req.headers["user-agent"] as string
      );

      // Criar notificação
      await notificationController.createNotification(req.userId, {
        title: "📝 Credenciais atualizadas",
        message: `Suas credenciais foram atualizadas. ${updatedFields.length} campo(s) modificado(s).`,
        type: "SUCCESS",
        metadata: {
          timestamp: new Date().toISOString(),
          updatedFields,
        },
      });

      return res.json({
        success: true,
        message: "Credenciais atualizadas com sucesso",
        user,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      console.error("Erro ao atualizar credenciais:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  //  Deletar conta - COM ISOLAMENTO
  async deleteAccount(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: "Senha é obrigatória para deletar a conta",
        });
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: req.userId }, //  ISOLAMENTO
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado",
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        // Registrar tentativa falha
        await eventService.createEvent(
          req.userId,
          "ACCOUNT_DELETE_FAILED",
          "Tentativa de exclusão de conta com senha incorreta",
          req.ip,
          req.headers["user-agent"] as string
        );

        return res.status(400).json({
          success: false,
          error: "Senha incorreta",
        });
      }

      // Registrar evento antes de deletar
      await eventService.createEvent(
        req.userId,
        "ACCOUNT_DELETED",
        "Conta deletada pelo usuário",
        req.ip,
        req.headers["user-agent"] as string,
        {
          email: user.email,
          name: user.name,
        }
      );

      //  Deletar usuário - COM ISOLAMENTO
      await prisma.user.delete({
        where: { id: req.userId }, //  ISOLAMENTO
      });

      return res.json({
        success: true,
        message: "Conta deletada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao deletar conta:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  //  Upload de foto de perfil - COM ISOLAMENTO
  async uploadProfilePicture(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      // Em produção, usar multer/cloudinary
      // Por enquanto, aceita URL
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: "URL da imagem é obrigatória",
        });
      }

      // Validar URL
      try {
        new URL(imageUrl);
      } catch {
        return res.status(400).json({
          success: false,
          error: "URL inválida",
        });
      }

      //  Atualizar foto - COM ISOLAMENTO
      const user = await prisma.user.update({
        where: { id: req.userId }, //  ISOLAMENTO
        data: {
          profilePicture: imageUrl,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          socialName: true,
          profilePicture: true,
          updatedAt: true,
        },
      });

      // Registrar evento
      await eventService.createEvent(
        req.userId,
        "PROFILE_PICTURE_UPDATE",
        "Foto de perfil atualizada",
        req.ip,
        req.headers["user-agent"] as string
      );

      // Criar notificação
      await notificationController.createNotification(req.userId, {
        title: " Foto atualizada",
        message: "Sua foto de perfil foi atualizada com sucesso.",
        type: "SUCCESS",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });

      return res.json({
        success: true,
        message: "Foto de perfil atualizada com sucesso",
        user,
      });
    } catch (error) {
      console.error("Erro ao atualizar foto de perfil:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },
};
