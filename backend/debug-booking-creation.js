// Debug script to test booking creation
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Booking } from "./models/bookingSchema.js";
import { Event } from "./models/eventSchema.js";

dotenv.config({ path: "./config/config.env" });

const debugBookingCreation = async () => {
  try {
    console.log("🔍 Starting Booking Debug Test...\n");
    
    // Step 1: Connect to MongoDB
    console.log("Step 1: Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected\n");
    
    // Step 2: Find a test user
    console.log("Step 2: Finding a test user...");
    const User = (await import("./models/userSchema.js")).User;
    const testUser = await User.findOne({ role: "user" });
    
    if (!testUser) {
      console.log("❌ No user found. Please create a user first.");
      return;
    }
    
    console.log(`✅ Found user: ${testUser.name} (${testUser._id})\n`);
    
    // Step 3: Find or create a full-service event
    console.log("Step 3: Finding full-service event...");
    const testEvent = await Event.findOne({ eventType: "full-service" });
    
    if (!testEvent) {
      console.log("Creating test full-service event...");
      const newEvent = await Event.create({
        title: "Test Full Service Event",
        description: "Debug event for booking test",
        eventType: "full-service",
        price: 5000,
        category: "photography",
        date: new Date(),
        time: "10:00 AM",
        location: "Test Location",
        createdBy: testUser._id,
        status: "active",
        addons: [
          { name: "Extra Hours", price: 500 },
          { name: "Premium Package", price: 1000 }
        ]
      });
      console.log(`✅ Created event: ${newEvent.title}\n`);
    } else {
      console.log(`✅ Found event: ${testEvent.title}\n`);
    }
    
    // Step 4: Try to create a booking with String serviceId
    console.log("Step 4: Testing booking creation with String serviceId...");
    try {
      const booking1 = await Booking.create({
        user: testUser._id,
        serviceId: testEvent._id.toString(), // Convert to String
        serviceTitle: testEvent.title,
        serviceCategory: testEvent.category || "event",
        servicePrice: testEvent.price,
        eventType: "full-service",
        eventDate: new Date(),
        eventTime: "14:30", // 24-hour format string
        guestCount: 1,
        totalPrice: testEvent.price + 500,
        status: "pending",
        payment: {
          paid: false,
          amount: testEvent.price + 500
        },
        addons: [
          { name: "Extra Hours", price: 500 }
        ],
        location: "Test Address",
        locationType: "custom",
        notes: "Debug test booking"
      });
      
      console.log("✅ SUCCESS! Booking created with String serviceId");
      console.log(`   Booking ID: ${booking1._id}`);
      console.log(`   serviceId type: ${typeof booking1.serviceId}`);
      console.log(`   serviceId value: ${booking1.serviceId}`);
      console.log(`   eventTime: ${booking1.eventTime}`);
      console.log(`   status: ${booking1.status}`);
      console.log(`   payment.paid: ${booking1.payment?.paid}\n`);
    } catch (error) {
      console.log("❌ FAILED with String serviceId");
      console.log(`   Error: ${error.message}`);
      console.log(`   Stack: ${error.stack}\n`);
    }
    
    // Step 5: Try to create a booking with ObjectId (should fail)
    console.log("Step 5: Testing booking creation with ObjectId (expected to fail)...");
    try {
      const booking2 = await Booking.create({
        user: testUser._id,
        serviceId: testEvent._id, // ObjectId - should fail
        serviceTitle: testEvent.title,
        serviceCategory: testEvent.category || "event",
        servicePrice: testEvent.price,
        eventType: "full-service",
        eventDate: new Date(),
        eventTime: "14:30",
        guestCount: 1,
        totalPrice: testEvent.price,
        status: "pending",
        addons: []
      });
      
      console.log("⚠️  Unexpected: Booking created with ObjectId (schema may allow it)");
      console.log(`   serviceId type: ${typeof booking2.serviceId}`);
    } catch (error) {
      console.log("✅ Expected: Failed with ObjectId");
      console.log(`   Error: ${error.message}\n`);
    }
    
    // Step 6: Check schema validation
    console.log("Step 6: Checking schema validation...");
    const bookingSchema = Booking.schema.obj;
    console.log("serviceId schema definition:");
    console.log(JSON.stringify(bookingSchema.serviceId, null, 2));
    
    // Step 7: List recent bookings
    console.log("\nStep 7: Recent bookings in database...");
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('serviceId serviceTitle eventTime status createdAt');
    
    console.log(`Found ${recentBookings.length} recent bookings:`);
    recentBookings.forEach((b, i) => {
      console.log(`${i+1}. serviceId: ${b.serviceId} (type: ${typeof b.serviceId})`);
      console.log(`   Title: ${b.serviceTitle}, Time: ${b.eventTime}, Status: ${b.status}`);
    });
    
    console.log("\n✅ Debug test complete!");
    console.log("\n📋 Summary:");
    console.log("- serviceId MUST be a String (not ObjectId)");
    console.log("- eventTime accepts 24-hour format strings (e.g., '14:30')");
    console.log("- payment object should have 'paid' boolean field");
    console.log("- addons defaults to empty array []");
    
  } catch (error) {
    console.error("\n❌ Debug test failed:");
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

debugBookingCreation();
