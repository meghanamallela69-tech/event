import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure one user can follow a merchant only once
followSchema.index({ user: 1, merchant: 1 }, { unique: true });

export const Follow = mongoose.model("Follow", followSchema);