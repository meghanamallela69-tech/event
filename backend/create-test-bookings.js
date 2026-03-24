import mongoose from "mongoose";
import { Booking } from "./models/bookingSchema.js";
import { User } from "./models/userSchema.js";
import { Event } from "./models/eventSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const createTestBookings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get a merchant and user
    const merchant = await User.findOne({ role: "merchant" });
    const user = await User.findOne({ role: "user" });
    const event = await Event.findOne({ createdBy: merchant?._id });

    if (!merchant || !user || !event) {
      console.log("Missing merchant, user, or event");
      console.log("Merchant:", merchant?._id);
      console.log("User:", user?._id);
      console.log("Event:", event?._id);
      process.exit(1);
    }

    // Create test bookings
    const testBookings = [
      {
        user: user._id,
        merchant: merchant._id,
        type: "event",
        eventType: "full-service",
        eventId: event._id,
        eventTitle: event.title,
        eventLocation: event.location,
        eventDate: event.date,
        bookingDate: new Date(),
        bookingStatus: "pending",
        paymentStatus: "pending",
        totalPrice: 5000,
        attendeeName: user.name,
        attendeeEmail: user.email
      },
      {
        user: user._id,
        merchant: merchant._id,
        type: "event",
        eventType: "full-service",
        eventId: event._id,
        eventTitle: event.title,
        eventLocation: event.location,
        eventDate: event.date,
        bookingDate: new Date(),
        bookingStatus: "confirmed",
        paymentStatus: "paid",
        totalPrice: 7500,
        attendeeName: user.name,
        attendeeEmail: user.email,
        rating: 4
      },
      {
        user: user._id,
        merchant: merchant._id,
        type: "event",
        eventType: "ticketed",
        eventId: event._id,
        eventTitle: event.title,
        eventLocation: event.location,
        eventDate: event.date,
        bookingDate: new Date(),
        bookingStatus: "completed",
        paymentStatus: "paid",
        totalPrice: 2000,
        ticketCount: 2,
        attendeeName: user.name,
        attendeeEmail: user.email,
        rating: 5,
        review: "Great event!"
      }
    ];

    // Insert test bookings
    const result = await Booking.insertMany(testBookings);
    console.log(`Created ${result.length} test bookings`);
    result.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.eventTitle} - Status: ${booking.bookingStatus}, Payment: ${booking.paymentStatus}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating test bookings:", error);
    process.exit(1);
  }
};

createTestBookings();