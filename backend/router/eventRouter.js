import express from "express";
import { 
  listEvents, 
  registerForEvent, 
  userRegistrations,
  searchEvents,
  getRecentBookings
} from "../controller/eventController.js";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", listEvents);
router.get("/search", searchEvents); // Search events by keyword
router.get("/recent-bookings", auth, ensureRole("user"), getRecentBookings); // Get recent bookings for dashboard
router.post("/:id/register", auth, ensureRole("user"), registerForEvent);
router.get("/me", auth, ensureRole("user"), userRegistrations);

export default router;
