import express from "express";
import { 
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getUnreadNotificationCount,
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from "../controller/adminProfileController.js";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin Profile routes
router.get("/profile", auth, ensureRole("admin"), getAdminProfile);
router.put("/profile", auth, ensureRole("admin"), updateAdminProfile);
router.post("/change-password", auth, ensureRole("admin"), changeAdminPassword);

// Notifications routes
router.get("/notifications/unread-count", auth, ensureRole("admin"), getUnreadNotificationCount);
router.get("/notifications", auth, ensureRole("admin"), getAdminNotifications);
router.put("/notifications/:id/read", auth, ensureRole("admin"), markNotificationAsRead);
router.post("/notifications/read-all", auth, ensureRole("admin"), markAllNotificationsAsRead);
router.delete("/notifications/:id", auth, ensureRole("admin"), deleteNotification);

export default router;
