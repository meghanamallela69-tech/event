import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    eventType: { type: String, enum: ["full-service", "ticketed"], default: "full-service" },
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    // Location & schedule
    location: { type: String, default: "" },
    date: { type: Date, default: null },
    time: { type: String, default: "" },
    duration: { type: Number, default: 1 },
    // Ticketed event fields - NEW
    ticketedEventType: { type: String, enum: ["live", "upcoming"], default: "upcoming" },
    totalTickets: { type: Number, default: 0 },
    availableTickets: { type: Number, default: 0 },
    ticketPrice: { type: Number, default: 0 },
    // Ticket types (e.g. Regular, VIP, etc.)
    ticketTypes: [
      {
        name: { type: String, required: true },        // e.g. "Regular", "VIP"
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 0 },
        available: { type: Number, required: true, min: 0 },
      }
    ],
    status: { type: String, enum: ["active", "inactive", "completed"], default: "active" },
    featured: { type: Boolean, default: false },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      }
    ],
    features: [String],
    // Add-on features for full-service events (e.g. Photography, Decoration)
    addons: [
      {
        name: { type: String, required: true },   // e.g. "Photography"
        price: { type: Number, required: true, min: 0 }, // extra charge
      }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
