import { Router } from "express";
import { profileController } from "../controllers/ProfileController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Rotas protegidas por autenticação
router.get("/", authenticateToken, profileController.getProfile);
router.put("/", authenticateToken, profileController.updateProfile);
router.put("/password", authenticateToken, profileController.updatePassword);
router.put("/credentials", authenticateToken, profileController.updateCredentials);
router.put("/profile-picture", authenticateToken, profileController.uploadProfilePicture);
router.delete("/", authenticateToken, profileController.deleteAccount);

export default router;
