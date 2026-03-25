import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";
import { 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  listMyEvents, 
  getEvent, 
  participantsForEvent,
  getEarnings,
  requestWithdrawal,
  getWithdrawalHistory,
  getMerchantPayments,
  getMerchantBookings,
  updateBookingStatus,
  getBookingDetails
} from "../controller/merchantController.js";
import { upload } from "../util/cloudinary.js";

const router = express.Router();

router.post("/events", auth, ensureRole("merchant"), upload.array('images', 4), createEvent);
router.put("/events/:id", auth, ensureRole("merchant"), upload.array('images', 4), updateEvent);
router.get("/events", auth, ensureRole("merchant"), listMyEvents);
router.get("/events/:id", auth, ensureRole("merchant"), getEvent);
router.get("/events/:id/participants", auth, ensureRole("merchant"), participantsForEvent);
router.delete("/events/:id", auth, ensureRole("merchant"), deleteEvent);

// Earnings and Withdrawal routes
router.get("/earnings", auth, ensureRole("merchant"), getEarnings);
router.post("/withdrawal", auth, ensureRole("merchant"), requestWithdrawal);
router.get("/withdrawals", auth, ensureRole("merchant"), getWithdrawalHistory);
router.get("/payments", auth, ensureRole("merchant"), getMerchantPayments);

// Bookings routes
router.get("/bookings", auth, ensureRole("merchant"), getMerchantBookings);
router.put("/bookings/:bookingId/status", auth, ensureRole("merchant"), updateBookingStatus);
router.get("/bookings/:bookingId/details", auth, ensureRole("merchant"), getBookingDetails);

export default router;
