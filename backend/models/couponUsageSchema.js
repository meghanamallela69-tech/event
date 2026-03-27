import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking"
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    discountAmount: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// Compound index to ensure one user can use a coupon only once
couponUsageSchema.index({ userId: 1, couponId: 1 }, { unique: true });

// Index for querying by user and service
couponUsageSchema.index({ userId: 1, serviceId: 1 });

export const CouponUsage = mongoose.model("CouponUsage", couponUsageSchema);
