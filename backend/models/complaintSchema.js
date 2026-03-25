import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: [
        'payment',
        'booking',
        'event',
        'service_quality',
        'technical_issue',
        'refund',
        'other'
      ],
      default: 'other'
    },
    relatedEntity: {
      entityType: {
        type: String, // 'Booking', 'Event', 'Payment', etc.
        enum: ['Booking', 'Event', 'Payment', 'User', 'Service', 'Other']
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId
      }
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'resolved', 'closed'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    adminNotes: [{
      note: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    resolution: {
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      resolvedAt: Date,
      resolutionText: String
    },
    attachments: [{
      url: String,
      filename: String
    }]
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ userId: 1 });

export const Complaint = mongoose.model("Complaint", complaintSchema);
