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
    eventType: {
      type: String,
      enum: ["full-service", "ticketed"],
      default: "full-service"
    },
    bookingDate: { 
      type: Date, 
      required: true 
    },
    eventDate: { 
      type: Date 
    },
    eventTime: {
      type: String,
      default: "TBD"
    },
    notes: { 
      type: String 
    },
    // Workflow status for both event types
    status: { 
      type: String, 
      enum: ["pending", "pending_payment", "accepted", "rejected", "paid", "confirmed", "cancelled", "completed"],
      default: "pending" 
    },
    // For full-service: merchant acceptance and addons
    merchantResponse: {
      accepted: { type: Boolean, default: null },
      responseDate: { type: Date },
      message: { type: String }
    },
    addons: [{
      name: { type: String },
      price: { type: Number }
    }],
    // Payment details
    payment: {
      paid: { type: Boolean, default: false },
      paymentId: { type: String },
      paymentDate: { type: Date },
      amount: { type: Number }
    },
    // Ticket details (for confirmed bookings)
    ticket: {
      ticketNumber: { type: String },
      qrCode: { type: String },
      generatedAt: { type: Date },
      ticketType: { type: String }, // For ticketed events (Regular, VIP, etc.)
      quantity: { type: Number, default: 1 },
      pricePerTicket: { type: Number } // Price per individual ticket
    },
    // Multiple ticket types selection (for ticketed events)
    selectedTickets: {
      type: Map,
      of: Number, // { "Regular": 2, "VIP": 1 }
      default: {}
    },
    // Discount and promo code info
    discount: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number
    },
    promoCode: {
      type: String
    },
    couponCode: {
      type: String
    },
    couponDetails: {
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
      code: { type: String },
      discountType: { type: String, enum: ["fixed", "percentage"] },
      discountValue: { type: Number },
      appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Merchant who created the coupon
    },
    guestCount: {
      type: Number,
      default: 1
    },
    totalPrice: {
      type: Number
    },
    location: {
      type: String,
      default: ""
    },
    locationType: {
      type: String,
      enum: ["event", "custom"],
      default: "event"
    },
    // Rating & Review (after event completion)
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: { type: String },
      createdAt: { type: Date }
    }
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
