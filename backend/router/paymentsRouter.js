import express from "express";
import { createOrder, verifyPayment, payForService, payForTicket } from "../controller/paymentsController.js";
import { 
  processPayment, 
  getUserBookings, 
  getBookingForPayment,
  processBookingRefund,
  getPaymentStatistics,
  getMerchantEarnings,
  getAllPayments,
  getUserPayments,
  getPaymentDetails
} from "../controller/paymentController.js";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Existing Razorpay routes
router.post("/create-order", auth, createOrder);
router.post("/verify", auth, verifyPayment);

// Service payment route
router.post("/pay-service", auth, payForService);

// Ticket payment route
router.post("/booking/:bookingId/pay-ticket", auth, payForTicket);

// New booking payment workflow routes
router.post("/booking/:bookingId/pay", auth, processPayment);
router.get("/user/bookings", auth, getUserBookings);
router.get("/booking/:bookingId", auth, getBookingForPayment);

// User payments routes
router.get("/user/my-payments", auth, getUserPayments); // Get user's payments with filter
router.get("/details/:paymentId", auth, getPaymentDetails); // Get payment details/receipt

// Refund routes
router.post("/booking/:bookingId/refund", auth, processBookingRefund);

// Admin payment statistics
router.get("/admin/statistics", auth, ensureRole("admin"), getPaymentStatistics);
router.get("/admin/all", auth, ensureRole("admin"), getAllPayments);

// Merchant earnings
router.get("/merchant/earnings", auth, getMerchantEarnings);
router.get("/admin/merchant/:merchantId/earnings", auth, ensureRole("admin"), getMerchantEarnings);

export default router;
