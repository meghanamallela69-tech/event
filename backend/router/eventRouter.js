import express from "express";
import { listEvents, registerForEvent, userRegistrations } from "../controller/eventController.js";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", listEvents);
router.post("/:id/register", auth, ensureRole("user"), registerForEvent);
router.get("/me", auth, ensureRole("user"), userRegistrations);

export default router;
