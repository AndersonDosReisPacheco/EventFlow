import { Router } from "express";
import { authController } from "../controllers/AuthController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Rotas públicas
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify", authController.verifyToken);
router.get("/health", authController.healthCheck);

// Rotas protegidas
router.post("/logout", authenticateToken, authController.logout);
router.get("/me", authenticateToken, authController.me);
router.post("/refresh", authenticateToken, authController.refreshToken);

export default router;
