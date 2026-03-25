import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";
import {
  createPromoCode,
  getMerchantPromoCodes,
  getPromoCodeById,
  updatePromoCode,
  deletePromoCode,
  sendPromotionalNotification,
  generateShareableLink
} from "../controller/marketingController.js";

const router = express.Router();

// Promo Code Routes
router.post("/promo-codes", auth, ensureRole("merchant"), createPromoCode);
router.get("/promo-codes", auth, ensureRole("merchant"), getMerchantPromoCodes);
router.get("/promo-codes/:id", auth, ensureRole("merchant"), getPromoCodeById);
router.put("/promo-codes/:id", auth, ensureRole("merchant"), updatePromoCode);
router.delete("/promo-codes/:id", auth, ensureRole("merchant"), deletePromoCode);

// Notification Routes
router.post("/send-notification", auth, ensureRole("merchant"), sendPromotionalNotification);

// Share Link Routes
router.get("/share-link/:eventId", auth, ensureRole("merchant"), generateShareableLink);

export default router;
