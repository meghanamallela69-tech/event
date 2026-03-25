import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processing", "completed"],
      default: "pending"
    },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      accountHolderName: { type: String },
      bankName: { type: String }
    },
    adminResponse: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      responseDate: { type: Date },
      message: { type: String },
      rejectionReason: { type: String }
    },
    paymentReference: {
      type: String
    },
    processedDate: {
      type: Date
    }
  },
  { timestamps: true }
);

// Index for faster queries
withdrawalSchema.index({ merchant: 1, status: 1 });
withdrawalSchema.index({ createdAt: -1 });

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
