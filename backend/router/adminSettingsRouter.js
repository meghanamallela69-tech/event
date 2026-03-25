import express from "express";
import { 
  getSettings,
  updateSettings,
  resetSettings
} from "../controller/adminSettingsController.js";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Settings routes
router.get("/settings", auth, ensureRole("admin"), getSettings);
router.put("/settings", auth, ensureRole("admin"), updateSettings);
router.post("/settings/reset", auth, ensureRole("admin"), resetSettings);

export default router;
