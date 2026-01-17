import { Router } from "express";
import { notificationController } from "../controllers/NotificationController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

// Rotas protegidas por autenticação
router.get("/", authenticateToken, notificationController.getNotifications);
router.get("/stats", authenticateToken, notificationController.getNotificationStats);
router.get("/unread-count", authenticateToken, notificationController.getUnreadCount);
router.post("/", authenticateToken, notificationController.createNotificationApi);
router.put("/:id", authenticateToken, notificationController.updateNotification);
router.put("/mark-all-read", authenticateToken, notificationController.markAllAsRead);
router.delete("/:id", authenticateToken, notificationController.deleteNotification);
router.delete("/", authenticateToken, notificationController.deleteAllNotifications);

export default router;
