import { Review } from "../models/reviewSchema.js";
import { Event } from "../models/eventSchema.js";
import { Booking } from "../models/bookingSchema.js";

// Create review
export const createReview = async (req, res) => {
  try {
    const { eventId, rating, reviewText } = req.body;
    const userId = req.user.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5 stars"
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if user booked this event
    const booking = await Booking.findOne({
      user: userId,
      eventId: eventId,
      status: { $in: ["confirmed", "completed"] }
    });

    if (!booking) {
      return res.status(403).json({
        success: false,
        message: "You can only review events you have booked"
      });
    }

    // Check if event is completed
    const now = new Date();
    const eventDate = new Date(event.date || booking.serviceDate);
    if (eventDate > now) {
      return res.status(400).json({
        success: false,
        message: "You can only review events after they are completed"
      });
    }

    // Check if user already reviewed this event
    const existingReview = await Review.findOne({
      user: userId,
      event: eventId
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.reviewText = reviewText || "";
      await existingReview.save();

      return res.status(200).json({
        success: true,
        message: "Review updated successfully",
        review: existingReview
      });
    } else {
      // Create new review
      const review = await Review.create({
        user: userId,
        event: eventId,
        rating: rating,
        reviewText: reviewText || ""
      });

      return res.status(201).json({
        success: true,
        message: "Review created successfully",
        review: review
      });
    }

  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create review"
    });
  }
};

// Get reviews for an event
export const getEventReviews = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ event: eventId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalReviews = await Review.countDocuments({ event: eventId });

    return res.status(200).json({
      success: true,
      reviews,
      totalReviews,
      currentPage: page,
      totalPages: Math.ceil(totalReviews / limit)
    });

  } catch (error) {
    console.error("Get event reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get reviews"
    });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.userId;

    const reviews = await Review.find({ user: userId })
      .populate("event", "title category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error("Get user reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user reviews"
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findOne({
      _id: reviewId,
      user: userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to delete it"
      });
    }

    await Review.deleteOne({ _id: reviewId });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review"
    });
  }
};

// Get latest reviews (public – for homepage testimonials)
export const getLatestReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewText: { $exists: true, $ne: "" } })
      .populate("user", "name")
      .populate("event", "title")
      .sort({ createdAt: -1 })
      .limit(6);

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to get reviews" });
  }
};