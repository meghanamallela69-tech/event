import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
categorySchema.index({ merchant: 1, name: 1 });
categorySchema.index({ isActive: 1 });

export const Category = mongoose.model("Category", categorySchema);
