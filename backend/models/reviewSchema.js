import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    reviewText: { type: String, default: "" },
  },
  { timestamps: true }
);

// Ensure one user can review an event only once
reviewSchema.index({ user: 1, event: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
