import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Additional fields for booking notifications
    eventId: {
      type: String
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking"
    },
    type: {
      type: String,
      enum: ["booking", "payment", "general"],
      default: "general"
    }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
