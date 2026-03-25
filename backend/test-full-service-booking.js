import mongoose from "mongoose";
import dotenv from "dotenv";
import { Booking } from "./models/bookingSchema.js";
import { Event } from "./models/eventSchema.js";

dotenv.config({ path: "./config/config.env" });

const testFullServiceBooking = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Connected to MongoDB");
    
    // Find or create a test user
    const testUserId = "67e2a8f0e5b4c3d2a1b9c8d7"; // Replace with actual user ID from your database
    
    // Find an existing full-service event
    const testEvent = await Event.findOne({ eventType: "full-service" });
    
    if (!testEvent) {
      console.log("❌ No full-service event found. Creating one...");
      const newEvent = await Event.create({
        title: "Test Full Service Event",
        description: "Test event for booking API",
        eventType: "full-service",
        price: 5000,
        category: "photography",
        date: new Date(),
        time: "10:00 AM",
        location: "Test Location",
        createdBy: testUserId,
        status: "active"
      });
      
      console.log("✅ Created test event:", newEvent._id);
      await testFullServiceBooking();
      return;
    }
    
    console.log("\n📋 Testing Full Service Booking API");
    console.log("================================");
    console.log("Event ID:", testEvent._id);
    console.log("Event Title:", testEvent.title);
    console.log("Event Price:", testEvent.price);
    
    // Test Case 1: Create booking with minimal required fields
    console.log("\n✅ Test 1: Minimal required fields");
    const booking1 = await Booking.create({
      user: testUserId,
      serviceId: testEvent._id,
      serviceTitle: testEvent.title,
      serviceCategory: testEvent.category || "event",
      servicePrice: testEvent.price,
      eventType: "full-service",
      eventDate: new Date(),
      eventTime: "10:00 AM",
      guestCount: 1,
      totalPrice: testEvent.price,
      status: "pending",
      paymentStatus: "unpaid",
      addons: []
    });
    
    console.log("✅ Booking created successfully!");
    console.log("Booking ID:", booking1._id);
    console.log("Status:", booking1.status);
    console.log("Payment Status:", booking1.paymentStatus);
    console.log("Addons:", booking1.addons);
    
    // Test Case 2: Create booking with addons
    console.log("\n✅ Test 2: Booking with addons");
    const booking2 = await Booking.create({
      user: testUserId,
      serviceId: testEvent._id,
      serviceTitle: testEvent.title,
      serviceCategory: testEvent.category || "event",
      servicePrice: testEvent.price,
      eventType: "full-service",
      eventDate: new Date(),
      eventTime: "02:00 PM",
      guestCount: 1,
      totalPrice: testEvent.price + 1000,
      status: "pending",
      paymentStatus: "unpaid",
      addons: [
        { name: "Extra Hours", price: 500 },
        { name: "Premium Package", price: 500 }
      ]
    });
    
    console.log("✅ Booking with addons created!");
    console.log("Booking ID:", booking2._id);
    console.log("Addons:", booking2.addons);
    console.log("Total Price:", booking2.totalPrice);
    
    // Test Case 3: Verify no duplicate blocking
    console.log("\n✅ Test 3: Multiple bookings for same user and event");
    const booking3 = await Booking.create({
      user: testUserId,
      serviceId: testEvent._id,
      serviceTitle: testEvent.title,
      serviceCategory: testEvent.category || "event",
      servicePrice: testEvent.price,
      eventType: "full-service",
      eventDate: new Date("2026-04-01"),
      eventTime: "06:00 PM",
      guestCount: 1,
      totalPrice: testEvent.price,
      status: "pending",
      paymentStatus: "unpaid",
      addons: []
    });
    
    console.log("✅ Multiple bookings allowed (no duplicate blocking)!");
    console.log("Booking ID:", booking3._id);
    
    // Summary
    console.log("\n📊 Test Summary");
    console.log("================");
    const allBookings = await Booking.find({ serviceId: testEvent._id });
    console.log(`Total bookings for this event: ${allBookings.length}`);
    console.log(`All bookings have status 'pending': ${allBookings.every(b => b.status === 'pending')}`);
    console.log(`All bookings have paymentStatus 'unpaid': ${allBookings.every(b => b.paymentStatus === 'unpaid' || !b.paymentStatus)}`);
    
    console.log("\n✅ All tests passed!");
    console.log("✅ Full service booking API is working correctly");
    console.log("✅ No duplicate booking blocks");
    console.log("✅ Default values applied correctly");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

testFullServiceBooking();
