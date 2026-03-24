import express from "express";
import {
  createRating,
  getEventRatings,
  getUserRatings,
} from "../controller/ratingController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes (require authentication)
router.post("/", auth, createRating);
router.get("/event/:eventId", getEventRatings);
router.get("/my-ratings", auth, getUserRatings);

export default router;