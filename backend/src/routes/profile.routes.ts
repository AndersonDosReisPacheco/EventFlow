import { Router } from "express";
import { profileController } from "../controllers/ProfileController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);
router.patch("/password", profileController.updatePassword);
router.delete("/", profileController.deleteAccount);
router.post("/upload-picture", profileController.uploadProfilePicture);


export default router;
