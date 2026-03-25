import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    commissionPercentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    platformName: {
      type: String,
      default: "Event Management System"
    },
    supportEmail: {
      type: String,
      default: "support@eventmanagement.com"
    },
    contactPhone: {
      type: String,
      default: ""
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD", "EUR", "GBP"]
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    enableCoupons: {
      type: Boolean,
      default: true
    },
    enableReviews: {
      type: Boolean,
      default: true
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    maxBookingQuantity: {
      type: Number,
      default: 10
    }
  },
  { timestamps: true }
);

// Ensure only one document exists
settingSchema.index({ unique: true });

export const Setting = mongoose.model("Setting", settingSchema);
