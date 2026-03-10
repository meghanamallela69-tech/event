import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  public_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Service category is required"],
      enum: [
        "wedding",
        "corporate",
        "birthday",
        "catering",
        "photography",
        "decoration",
        "concert",
        "camping",
        "gaming",
        "anniversary",
        "party",
        "other",
      ],
    },
    price: {
      type: Number,
      required: [true, "Service price is required"],
      min: [0, "Price cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: function (v) {
          return v.length >= 1 && v.length <= 4;
        },
        message: "Service must have between 1 and 4 images",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for search
serviceSchema.index({ title: "text", description: "text", category: "text" });

export const Service = mongoose.model("Service", serviceSchema);
