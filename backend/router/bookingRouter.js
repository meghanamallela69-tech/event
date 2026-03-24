import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  processPayment,
  getMerchantBookings,
  respondToBooking,
  confirmBooking,
  completeBooking,
  submitRating,
} from "../controller/bookingController.js";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// User routes (require authentication)
router.post("/", auth, createBooking);
router.get("/my-bookings", auth, getUserBookings);
router.get("/:id", auth, getBookingById);
router.put("/:id/cancel", auth, cancelBooking);
router.post("/:id/pay", auth, processPayment);
router.put("/:id/complete", auth, completeBooking);
router.post("/:id/rate", auth, submitRating);

// Merchant routes
router.get("/merchant/my-bookings", auth, ensureRole("merchant"), getMerchantBookings);
router.put("/merchant/:id/respond", auth, ensureRole("merchant"), respondToBooking);
router.put("/merchant/:id/confirm", auth, ensureRole("merchant"), confirmBooking);

// Admin routes
router.get("/admin/all", auth, ensureRole("admin"), getAllBookings);
router.put("/admin/:id/status", auth, ensureRole("admin"), updateBookingStatus);

export default router;
