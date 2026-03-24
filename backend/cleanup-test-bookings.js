import { dbConnection } from "./database/dbConnection.js";
import { Booking } from "./models/bookingSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const cleanupTestBookings = async () => {
  try {
    console.log("🧹 Cleaning up test bookings...");
    await dbConnection();
    
    // Delete test bookings (those with test notes or from test user)
    const result = await Booking.deleteMany({
      $or: [
        { notes: { $regex: /test/i } },
        { attendeeName: "Test User" },
        { attendeeEmail: "user@test.com" }
      ]
    });
    
    console.log(`✅ Deleted ${result.deletedCount} test bookings`);
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Cleanup error:", error);
    process.exit(1);
  }
};

cleanupTestBookings();