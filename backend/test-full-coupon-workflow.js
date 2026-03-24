import axios from "axios";
import { dbConnection } from "./database/dbConnection.js";
import { Booking } from "./models/bookingSchema.js";
import { Event } from "./models/eventSchema.js";
import { User } from "./models/userSchema.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

const API_BASE = "http://localhost:4001/api/v1";

const testFullCouponWorkflow = async () => {
  try {
    console.log("🧪 Testing Full Coupon Workflow");
    console.log("===============================");
    
    // Connect to database to check data
    await dbConnection();
    
    // Step 1: Login as test user
    console.log("\n1. Logging in as test user...");
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: "user@test.com",
      password: "User@123"
    });
    
    if (!loginResponse.data.success) {
      throw new Error("Login failed");
    }
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    const userId = loginResponse.data.user._id;
    console.log("✅ Login successful, User ID:", userId);
    
    // Step 2: Find a test event
    console.log("\n2. Finding a test event...");
    const events = await Event.find({ eventType: "full-service" }).limit(1);
    if (events.length === 0) {
      throw new Error("No full-service events found");
    }
    
    const testEvent = events[0];
    console.log(`✅ Found event: ${testEvent.title} (₹${testEvent.price})`);
    
    // Step 3: Get available coupons
    console.log("\n3. Getting available coupons...");
    try {
      const couponsResponse = await axios.get(`${API_BASE}/coupons/available?totalAmount=${testEvent.price}`, {
        headers
      });
      
      console.log("✅ Available coupons response:", couponsResponse.data);
      
      if (couponsResponse.data.success && couponsResponse.data.coupons.length > 0) {
        const testCoupon = couponsResponse.data.coupons[0];
        console.log(`✅ Using coupon: ${testCoupon.code}`);
        
        // Step 4: Create booking with coupon
        console.log("\n4. Creating booking with coupon...");
        const bookingPayload = {
          eventId: testEvent._id,
          serviceDate: "2026-04-01",
          guestCount: 2,
          notes: "Test booking with coupon",
          couponCode: testCoupon.code
        };
        
        console.log("Booking payload:", bookingPayload);
        
        const bookingResponse = await axios.post(`${API_BASE}/event-bookings/create`, bookingPayload, {
          headers
        });
        
        console.log("✅ Booking response:", bookingResponse.data);
        
        if (bookingResponse.data.success) {
          const booking = bookingResponse.data.booking;
          console.log(`✅ Booking created: ${booking._id}`);
          console.log(`   Original Amount: ₹${booking.originalAmount || booking.totalPrice}`);
          console.log(`   Discount Amount: ₹${booking.discountAmount || 0}`);
          console.log(`   Final Amount: ₹${booking.finalAmount || booking.totalPrice}`);
          console.log(`   Coupon Code: ${booking.couponCode || 'None'}`);
          
          // Step 5: Verify booking in database
          console.log("\n5. Verifying booking in database...");
          const dbBooking = await Booking.findById(booking._id);
          if (dbBooking) {
            console.log("✅ Booking found in database:");
            console.log(`   Coupon Code: ${dbBooking.couponCode || 'None'}`);
            console.log(`   Original Amount: ₹${dbBooking.originalAmount || dbBooking.totalPrice}`);
            console.log(`   Discount Amount: ₹${dbBooking.discountAmount || 0}`);
            console.log(`   Final Amount: ₹${dbBooking.finalAmount || dbBooking.totalPrice}`);
          } else {
            console.log("❌ Booking not found in database");
          }
        }
      } else {
        console.log("⚠️ No available coupons found, testing without coupon...");
        
        // Create booking without coupon
        const bookingPayload = {
          eventId: testEvent._id,
          serviceDate: "2026-04-01",
          guestCount: 2,
          notes: "Test booking without coupon"
        };
        
        const bookingResponse = await axios.post(`${API_BASE}/event-bookings/create`, bookingPayload, {
          headers
        });
        
        console.log("✅ Booking without coupon:", bookingResponse.data);
      }
    } catch (couponError) {
      console.error("❌ Coupon API error:", couponError.response?.data || couponError.message);
    }
    
    console.log("\n✅ Full coupon workflow test completed!");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Workflow test failed:", error.response?.data || error.message);
    process.exit(1);
  }
};

testFullCouponWorkflow();