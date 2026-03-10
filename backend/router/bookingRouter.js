import express from "express";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} from "../controller/bookingController.js";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// User routes (require authentication)
router.post("/", auth, createBooking);
router.get("/my-bookings", auth, getUserBookings);
router.get("/:id", auth, getBookingById);
router.put("/:id/cancel", auth, cancelBooking);

// Admin routes
router.get("/admin/all", auth, ensureRole("admin"), getAllBookings);
router.put("/admin/:id/status", auth, ensureRole("admin"), updateBookingStatus);

export default router;
