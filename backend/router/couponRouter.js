import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";
import {
  applyCoupon,
  removeCoupon,
  getAvailableCoupons,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponStats,
  validateCoupon,
  recordCouponUsage,
  getUserCouponUsage
} from "../controller/couponController.js";

const router = express.Router();

console.log("🔧 Coupon Router: Registering routes...");

// User routes - Apply/Remove coupons
router.post("/validate", auth, validateCoupon);
router.post("/apply", auth, applyCoupon);
router.post("/remove", auth, removeCoupon);
router.get("/available", auth, getAvailableCoupons);
router.post("/record-usage", auth, recordCouponUsage);
router.get("/my-usage", auth, getUserCouponUsage);

// Admin routes - Manage coupons
router.post("/create", auth, ensureRole("admin"), createCoupon);
router.get("/all", auth, ensureRole("admin"), getAllCoupons);
router.put("/:couponId", auth, ensureRole("admin"), updateCoupon);
router.delete("/:couponId", auth, ensureRole("admin"), deleteCoupon);
router.patch("/:couponId/toggle", auth, ensureRole("admin"), toggleCouponStatus);
router.get("/stats", auth, ensureRole("admin"), getCouponStats);

console.log("✅ Coupon Router: All routes registered");

export default router;