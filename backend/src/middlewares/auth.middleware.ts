import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token de acesso não fornecido"
      });
    }

    const secret = process.env.JWT_SECRET || "eventflow_secret_key_development_2024_changeme_for_production";

    const decoded = jwt.verify(token, secret) as { userId: string };

    // Verificar se o usuário ainda existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Usuário não encontrado"
      });
    }

    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("Erro na autenticação:", err);

    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        success: false,
        error: "Token inválido ou malformado"
      });
    }

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(403).json({
        success: false,
        error: "Token expirado"
      });
    }

    return res.status(403).json({
      success: false,
      error: "Token inválido ou expirado"
    });
  }
};
