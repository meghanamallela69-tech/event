import express from "express";
import { 
  createBooking,
  createFullServiceBooking,
  createTicketedBooking,
  getEventTicketTypes,
  approveFullServiceBooking,
  rejectFullServiceBooking,
  getMerchantServiceRequests,
  updateEvent,
  getBookingsByUserId,
  markBookingCompleted,
  updateBookingStatus,
  getMerchantBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  processPayment,
  addRating
} from "../controller/eventBookingController.js";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// User routes
router.post("/create", auth, createBooking);
router.post("/full-service", auth, createFullServiceBooking);
router.post("/ticketed", auth, createTicketedBooking);
router.get("/event/:eventId/tickets", auth, getEventTicketTypes);
router.get("/my-bookings", auth, getBookingsByUserId);
router.get("/user/:userId", auth, getBookingsByUserId);
router.put("/:bookingId/pay", auth, processPayment);
router.post("/:bookingId/rating", auth, addRating);

// Merchant routes
router.get("/service-requests", auth, ensureRole("merchant"), getMerchantServiceRequests);
router.get("/merchant/bookings", auth, ensureRole("merchant"), getMerchantBookings);
router.put("/:id/accept", auth, ensureRole("merchant"), acceptBooking);
router.put("/:id/reject", auth, ensureRole("merchant"), rejectBooking);
router.put("/:id/complete", auth, ensureRole("merchant"), completeBooking);
router.put("/:bookingId/approve", auth, ensureRole("merchant"), approveFullServiceBooking);
router.put("/:bookingId/reject", auth, ensureRole("merchant"), rejectFullServiceBooking);
router.put("/:bookingId/complete", auth, ensureRole("merchant"), markBookingCompleted);
router.put("/:bookingId/status", auth, ensureRole("merchant"), updateBookingStatus);

export default router;