import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";
import {
  getEventAnalytics,
  getMerchantAnalyticsSummary
} from "../controller/analyticsController.js";

const router = express.Router();

// Get analytics for specific event
router.get("/event/:eventId", auth, ensureRole("merchant"), getEventAnalytics);

// Get summary analytics for all merchant events
router.get("/summary", auth, ensureRole("merchant"), getMerchantAnalyticsSummary);

export default router;
