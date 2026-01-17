import { Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { z } from "zod";
import { eventService } from "../services/EventService";

// Schemas de validação
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  socialName: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Senha é obrigatória para excluir a conta"),
});

export const profileController = {
  // ============ OBTER PERFIL ============
  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
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

      // Log de acesso ao perfil
      await eventService.createEvent({
        userId: req.userId,
        type: "PROFILE_ACCESS",
        message: "Usuário acessou página de perfil",
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] as string,
      });

      return res.json({
        success: true,
        user,
      });
    } catch (error: any) {
      console.error("Erro ao obter perfil:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // ============ ATUALIZAR PERFIL ============
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const validatedData = updateProfileSchema.parse(req.body);

      const user = await prisma.user.update({
        where: { id: req.userId },
        data: validatedData,
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

      // Log de atualização de perfil
      await eventService.createEvent({
        userId: req.userId,
        type: "PROFILE_UPDATED",
        message: "Perfil atualizado com sucesso",
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] as string,
        metadata: {
          updatedFields: Object.keys(validatedData),
        },
      });

      return res.json({
        success: true,
        message: "Perfil atualizado com sucesso",
        user,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);

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

      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // ============ ATUALIZAR SENHA ============
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
        where: { id: req.userId },
        select: {
          id: true,
          password: true,
        },
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
        // Log de tentativa falha
        await eventService.createEvent({
          userId: req.userId,
          type: "PASSWORD_CHANGE_FAILED",
          message: "Tentativa de alteração de senha com senha atual incorreta",
          ip: req.ip || "unknown",
          userAgent: req.headers["user-agent"] as string,
        });

        return res.status(400).json({
          success: false,
          error: "Senha atual incorreta",
        });
      }

      // Hash da nova senha
      const hashedNewPassword = await bcrypt.hash(
        validatedData.newPassword,
        10
      );

      // Atualizar senha
      await prisma.user.update({
        where: { id: req.userId },
        data: { password: hashedNewPassword },
      });

      // Log de alteração de senha bem-sucedida
      await eventService.createEvent({
        userId: req.userId,
        type: "PASSWORD_CHANGED",
        message: "Senha alterada com sucesso",
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] as string,
      });

      return res.json({
        success: true,
        message: "Senha alterada com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);

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

      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // ============ EXCLUIR CONTA ============
  async deleteAccount(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const validatedData = deleteAccountSchema.parse(req.body);

      // Buscar usuário com senha
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado",
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(
        validatedData.password,
        user.password
      );

      if (!isPasswordValid) {
        // Log de tentativa falha
        await eventService.createEvent({
          userId: req.userId,
          type: "ACCOUNT_DELETE_FAILED",
          message: "Tentativa de exclusão de conta com senha incorreta",
          ip: req.ip || "unknown",
          userAgent: req.headers["user-agent"] as string,
        });

        return res.status(400).json({
          success: false,
          error: "Senha incorreta",
        });
      }

      // Log antes de excluir
      await eventService.createEvent({
        userId: req.userId,
        type: "ACCOUNT_DELETED",
        message: "Conta deletada pelo usuário",
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] as string,
        metadata: {
          userId: req.userId,
          email: user.email,
          name: user.name,
        },
      });

      // Excluir usuário (cascade excluirá eventos e notificações)
      await prisma.user.delete({
        where: { id: req.userId },
      });

      return res.json({
        success: true,
        message: "Conta excluída com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao excluir conta:", error);

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

      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },

  // ============ UPLOAD DE FOTO DE PERFIL ============
  async uploadProfilePicture(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Não autenticado",
        });
      }

      const { profilePicture } = req.body;

      if (!profilePicture) {
        return res.status(400).json({
          success: false,
          error: "URL da foto de perfil é obrigatória",
        });
      }

      // Validar URL (simples)
      try {
        new URL(profilePicture);
      } catch {
        return res.status(400).json({
          success: false,
          error: "URL inválida",
        });
      }

      const user = await prisma.user.update({
        where: { id: req.userId },
        data: { profilePicture },
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

      // Log de atualização de foto
      await eventService.createEvent({
        userId: req.userId,
        type: "PROFILE_PICTURE_UPDATE",
        message: "Foto de perfil atualizada",
        ip: req.ip || "unknown",
        userAgent: req.headers["user-agent"] as string,
      });

      return res.json({
        success: true,
        message: "Foto de perfil atualizada com sucesso",
        user,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar foto de perfil:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  },
};
