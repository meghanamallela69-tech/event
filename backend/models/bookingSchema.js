import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    serviceId: { 
      type: String, 
      required: true 
    },
    serviceTitle: { 
      type: String, 
      required: true 
    },
    serviceCategory: { 
      type: String, 
      required: true 
    },
    servicePrice: { 
      type: Number, 
      required: true 
    },
    bookingDate: { 
      type: Date, 
      required: true 
    },
    eventDate: { 
      type: Date 
    },
    notes: { 
      type: String 
    },
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending" 
    },
    guestCount: {
      type: Number,
      default: 1
    },
    totalPrice: {
      type: Number
    }
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
