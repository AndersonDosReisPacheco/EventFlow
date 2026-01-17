import { Router } from "express";
import { eventController } from "../controllers/EventController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

//  ROTAS ATUALIZADAS
router.get("/", authenticateToken, eventController.getEvents);
router.get("/types", authenticateToken, eventController.getEventTypes);
router.get("/recent", authenticateToken, eventController.getRecentEvents);
router.get("/stats", authenticateToken, eventController.getEventStats); // ✅ NOVA
router.get("/chart", authenticateToken, eventController.getEventsChartData); // ✅ NOVA
router.get("/:id", authenticateToken, eventController.getEventDetails);
router.post(
  "/dashboard-access",
  authenticateToken,
  eventController.logDashboardAccess
);

export default router;
