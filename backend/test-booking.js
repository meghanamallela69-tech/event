import mongoose from "mongoose";
import { User } from "./models/userSchema.js";
import { Event } from "./models/eventSchema.js";
import { Booking } from "./models/bookingSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const testBooking = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if we have users
    const users = await User.find({ role: "user" }).limit(1);
    console.log("👥 Users found:", users.length);
    if (users.length > 0) {
      console.log("First user:", users[0].email, users[0]._id);
    }

    // Check if we have events
    const events = await Event.find().limit(3);
    console.log("📅 Events found:", events.length);
    events.forEach(event => {
      console.log(`- ${event.title} (${event.eventType}) - ID: ${event._id}`);
    });

    // Check existing bookings
    const bookings = await Booking.find().limit(5);
    console.log("📋 Existing bookings:", bookings.length);
    bookings.forEach(booking => {
      console.log(`- ${booking.eventTitle} - Status: ${booking.status} - User: ${booking.user}`);
    });

    await mongoose.disconnect();
    console.log("✅ Test completed");

  } catch (error) {
    console.error("❌ Test error:", error);
  }
};

testBooking();