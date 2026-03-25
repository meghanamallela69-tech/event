import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'create',
        'update', 
        'delete',
        'view',
        'login',
        'logout',
        'accept_booking',
        'reject_booking',
        'process_payment',
        'issue_refund',
        'resolve_complaint',
        'other'
      ]
    },
    entity: {
      type: String, // e.g., 'User', 'Event', 'Booking', 'Payment'
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userEmail: {
      type: String
    },
    userName: {
      type: String
    },
    details: {
      type: String,
      default: ""
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ entity: 1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
