import mongoose from "mongoose";
import { config } from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";

// Load environment variables
config();

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB\n");

async function createTestCoupons() {
  try {
    console.log("\n=== CREATING TEST COUPONS FOR EVENTS ===\n");

    // Get all events
    const events = await Event.find().select('title createdBy');
    
    if (events.length === 0) {
      console.log("❌ No events found in database!");
      return;
    }

    console.log(`Found ${events.length} events. Creating coupons...\n`);

    for (const event of events) {
      console.log(`Creating coupon for: ${event.title}`);
      
      // Check if coupon already exists for this event
      const existingCoupon = await Coupon.findOne({ 
        applicableEvents: event._id 
      });
      
      if (existingCoupon) {
        console.log(`  ⚠️  Coupon already exists: ${existingCoupon.code}\n`);
        continue;
      }
      
      // Create a test coupon
      const coupon = await Coupon.create({
        code: `${event.title.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 100)}`,
        name: `Discount for ${event.title}`,
        discountType: "percentage",
        discountValue: 10,
        maxDiscount: 500,
        minAmount: 100,
        usageLimit: 100,
        usedCount: 0,
        isActive: true,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        applicableEvents: [event._id],
        applicableCategories: [],
        applicableUsers: [],
        createdBy: event.createdBy,
        description: `Get 10% off on ${event.title}`,
        usageHistory: []
      });
      
      console.log(`  ✅ Created: ${coupon.code}`);
      console.log(`     Discount: ${coupon.discountValue}%`);
      console.log(`     Min Amount: ₹${coupon.minAmount}`);
      console.log(`     Max Discount: ₹${coupon.maxDiscount}`);
      console.log(`     Valid until: ${new Date(coupon.expiryDate).toLocaleDateString()}\n`);
    }

    console.log("\n🎉 Test coupons created successfully!");
    console.log("\nTo test:");
    console.log("1. Restart backend server");
    console.log("2. Open user dashboard");
    console.log("3. Click 'Book Now' on any event");
    console.log("4. You should see available coupons in the booking modal");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

createTestCoupons();
