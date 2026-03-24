import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { ensureRole } from "../middleware/roleMiddleware.js";
import { createEvent, updateEvent, deleteEvent, listMyEvents, getEvent, participantsForEvent } from "../controller/merchantController.js";
import { upload } from "../util/cloudinary.js";

const router = express.Router();

router.post("/events", auth, ensureRole("merchant"), upload.array('images', 4), createEvent);
router.put("/events/:id", auth, ensureRole("merchant"), upload.array('images', 4), updateEvent);
router.get("/events", auth, ensureRole("merchant"), listMyEvents);
router.get("/events/:id", auth, ensureRole("merchant"), getEvent);
router.get("/events/:id/participants", auth, ensureRole("merchant"), participantsForEvent);
router.delete("/events/:id", auth, ensureRole("merchant"), deleteEvent);

export default router;
