import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    maxDiscount: {
      type: Number,
      min: 0,
      default: null // Only for percentage type
    },
    minAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    expiryDate: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      maxlength: 200
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // Optional: Restrict to specific events or categories
    applicableEvents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    }],
    applicableCategories: [{
      type: String
    }],
    // Optional: User restrictions
    applicableUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    // Track usage
    usageHistory: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
      },
      usedAt: {
        type: Date,
        default: Date.now
      },
      discountAmount: Number
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for remaining usage
couponSchema.virtual('remainingUsage').get(function() {
  return this.usageLimit - this.usedCount;
});

// Virtual for usage percentage
couponSchema.virtual('usagePercentage').get(function() {
  return (this.usedCount / this.usageLimit) * 100;
});

// Index for faster queries
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, expiryDate: 1 });
couponSchema.index({ createdBy: 1 });

// Pre-save middleware to ensure code is uppercase
couponSchema.pre('save', function(next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

export const Coupon = mongoose.model("Coupon", couponSchema);