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
  getReports,
  getPublicStats,
} from "../controller/adminController.js";

const router = express.Router();

router.get("/public-stats", getPublicStats);
router.get("/users", auth, ensureRole("admin"), listUsers);
router.get("/merchants", auth, ensureRole("admin"), listMerchants);
router.post("/create-merchant", auth, ensureRole("admin"), createMerchant);
router.delete("/users/:id", auth, ensureRole("admin"), deleteUser);
router.get("/events", auth, ensureRole("admin"), listEventsAdmin);
router.delete("/events/:id", auth, ensureRole("admin"), deleteEventAdmin);
router.get("/registrations", auth, ensureRole("admin"), listRegistrationsAdmin);
router.get("/reports", auth, ensureRole("admin"), getReports);

export default router;
