import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";
import {
  listUsers,
  deleteUser,
  listEventsAdmin,
  deleteEventAdmin,
  listRegistrationsAdmin,
  createMerchant,
  listMerchants,
  updateMerchant,
  suspendMerchant,
  resetMerchantPassword,
  updateUserStatus,
  getReports,
  getPublicStats,
  getAllTransactions,
  getCommissionDetails,
  getPayoutDetails,
  handleRefund,
  getRefundRequests,
  getAllBookings,
  getAnalytics
} from "../controller/adminController.js";

const router = express.Router();

router.get("/public-stats", getPublicStats);
router.get("/users", auth, ensureRole("admin"), listUsers);
router.put("/users/:id/status", auth, ensureRole("admin"), updateUserStatus);
router.get("/merchants", auth, ensureRole("admin"), listMerchants);
router.post("/create-merchant", auth, ensureRole("admin"), createMerchant);
router.put("/merchants/:id", auth, ensureRole("admin"), updateMerchant);
router.put("/merchants/:id/suspend", auth, ensureRole("admin"), suspendMerchant);
router.post("/merchants/:id/reset-password", auth, ensureRole("admin"), resetMerchantPassword);
router.delete("/users/:id", auth, ensureRole("admin"), deleteUser);
router.get("/events", auth, ensureRole("admin"), listEventsAdmin);
router.delete("/events/:id", auth, ensureRole("admin"), deleteEventAdmin);
router.get("/registrations", auth, ensureRole("admin"), listRegistrationsAdmin);
router.get("/reports", auth, ensureRole("admin"), getReports);

// Payment management routes
router.get("/payments/transactions", auth, ensureRole("admin"), getAllTransactions);
router.get("/payments/commission", auth, ensureRole("admin"), getCommissionDetails);
router.get("/payments/payouts", auth, ensureRole("admin"), getPayoutDetails);
router.get("/payments/refunds", auth, ensureRole("admin"), getRefundRequests);
router.post("/payments/refund/:paymentId", auth, ensureRole("admin"), handleRefund);

// Bookings management
router.get("/bookings/all", auth, ensureRole("admin"), getAllBookings);

// Analytics
router.get("/analytics", auth, ensureRole("admin"), getAnalytics);

export default router;
