import { Router } from "express";
import { authController } from "../controllers/AuthController";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Aumentado para 20 tentativas
  message: {
    success: false,
    message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
    error: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false, // Conta todas as tentativas
  skipSuccessfulRequests: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 tentativas por hora
  message: {
    success: false,
    message: "Muitas tentativas de registro. Tente novamente mais tarde.",
    error: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", registerLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/logout", authenticateToken, authController.logout);
router.get("/verify", authController.verifyToken);
router.get("/me", authenticateToken, authController.me);
router.post("/refresh", authController.refreshToken);
router.get("/health", authController.healthCheck);

export default router;
