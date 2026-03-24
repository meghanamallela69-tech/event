import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    },
    // Payment amounts
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    adminCommission: {
      type: Number,
      required: true,
      min: 0
    },
    merchantAmount: {
      type: Number,
      required: true,
      min: 0
    },
    adminCommissionPercent: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
      max: 100
    },
    // Payment details
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Card", "NetBanking", "Cash", "Wallet"],
      required: true
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    paymentGateway: {
      type: String,
      default: "manual"
    },
    // Refund details
    refundAmount: {
      type: Number,
      default: 0
    },
    refundReason: {
      type: String
    },
    refundDate: {
      type: Date
    },
    refundTransactionId: {
      type: String
    },
    // Payout details
    merchantPayoutStatus: {
      type: String,
      enum: ["pending", "processed", "completed", "failed"],
      default: "pending"
    },
    merchantPayoutDate: {
      type: Date
    },
    merchantPayoutReference: {
      type: String
    },
    // Additional metadata
    currency: {
      type: String,
      default: "INR"
    },
    description: {
      type: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for commission percentage calculation
paymentSchema.virtual('calculatedCommissionPercent').get(function() {
  return this.totalAmount > 0 ? (this.adminCommission / this.totalAmount) * 100 : 0;
});

// Virtual for merchant percentage
paymentSchema.virtual('merchantPercent').get(function() {
  return this.totalAmount > 0 ? (this.merchantAmount / this.totalAmount) * 100 : 0;
});

// Index for faster queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ merchantId: 1, createdAt: -1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ paymentStatus: 1 });

// Pre-save middleware to validate amounts
paymentSchema.pre('save', function(next) {
  // Validate that adminCommission + merchantAmount = totalAmount
  const calculatedTotal = this.adminCommission + this.merchantAmount;
  const tolerance = 0.01; // Allow for small rounding differences
  
  if (Math.abs(calculatedTotal - this.totalAmount) > tolerance) {
    return next(new Error(`Amount mismatch: adminCommission (${this.adminCommission}) + merchantAmount (${this.merchantAmount}) != totalAmount (${this.totalAmount})`));
  }
  
  next();
});

export const Payment = mongoose.model("Payment", paymentSchema);