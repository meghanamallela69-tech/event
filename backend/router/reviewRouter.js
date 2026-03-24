import express from "express";
import {
  createReview,
  getEventReviews,
  getUserReviews,
  deleteReview,
  getLatestReviews,
} from "../controller/reviewController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/latest", getLatestReviews);
router.post("/", auth, createReview);
router.get("/event/:eventId", getEventReviews);
router.get("/my-reviews", auth, getUserReviews);
router.delete("/:reviewId", auth, deleteReview);

export default router;