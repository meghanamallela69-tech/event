import mongoose from "mongoose";
import { config } from "dotenv";
import { Coupon } from "./models/couponSchema.js";
import { Event } from "./models/eventSchema.js";
import { User } from "./models/userSchema.js";

config();
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB\n");

async function createDileepCoupons() {
  try {
    console.log("🔍 FINDING DILEEP'S EVENTS\n");

    // Find Dileep (merchant user)
    const dileep = await User.findOne({ email: "mmeghana@speshway.com" });
    
    if (!dileep) {
      console.log("❌ Dileep user not found!");
      return;
    }
    
    console.log(`Merchant: ${dileep.name} (${dileep.email})`);
    console.log(`User ID: ${dileep._id}\n`);
    
    // Find events created by Dileep
    const dileepsEvents = await Event.find({ createdBy: dileep._id })
      .select('title _id');
    
    console.log(`Found ${dileepsEvents.length} event(s) created by Dileep:\n`);
    
    dileepsEvents.forEach((event, idx) => {
      console.log(`${idx + 1}. ${event.title}`);
      console.log(`   Event ID: ${event._id}\n`);
    });
    
    if (dileepsEvents.length === 0) {
      console.log("\n⚠️  No events found for Dileep!\n");
      return;
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("🎫  CREATING MERCHANT COUPONS FOR DILEEP'S EVENTS");
    console.log("=".repeat(60) + "\n");
    
    // Create a coupon for each of Dileep's events
    for (const event of dileepsEvents) {
      // Check if coupon already exists
      const existingCoupon = await Coupon.findOne({
        applicableEvents: event._id,
        createdBy: dileep._id
      });
      
      if (existingCoupon) {
        console.log(`⚠️  Coupon already exists for "${event.title}": ${existingCoupon.code}`);
        continue;
      }
      
      // Generate coupon code based on event name
      const eventWords = event.title.split(' ').slice(0, 2);
      const codePrefix = eventWords.map(w => w.substring(0, 3).toUpperCase()).join('');
      const randomNum = Math.floor(Math.random() * 100);
      const couponCode = `${codePrefix}${randomNum}`;
      
      // Create merchant coupon
      const coupon = await Coupon.create({
        code: couponCode,
        name: `Special discount for ${event.title}`,
        discountType: "percentage",
        discountValue: 15,  // 15% discount for merchant's own event
        maxDiscount: 1000,
        minAmount: 500,
        usageLimit: 50,
        usedCount: 0,
        isActive: true,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
        applicableEvents: [event._id],
        applicableCategories: [],
        applicableUsers: [],
        createdBy: dileep._id,
        description: `Get 15% off on ${event.title} - Merchant special offer`,
        usageHistory: []
      });
      
      console.log(`✅ Created coupon for "${event.title}":`);
      console.log(`   Code: ${coupon.code}`);
      console.log(`   Discount: ${coupon.discountValue}%`);
      console.log(`   Min Amount: ₹${coupon.minAmount}`);
      console.log(`   Max Discount: ₹${coupon.maxDiscount}`);
      console.log(`   Usage Limit: ${coupon.usageLimit}`);
      console.log(`   Valid Until: ${new Date(coupon.expiryDate).toLocaleDateString()}`);
      console.log(`   Merchant: ${dileep.name}\n`);
    }
    
    console.log("=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    
    // Count total merchant coupons now
    const totalMerchantCoupons = await Coupon.countDocuments({ 
      createdBy: dileep._id 
    });
    
    console.log(`Total merchant coupons created by Dileep: ${totalMerchantCoupons}`);
    console.log("\n✅ Merchant coupons are now visible in booking modal!\n");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

createDileepCoupons();
